/**
 * Migration script: Download Cloudinary images and upload as Sanity native assets.
 *
 * For each product that has a cloudinaryImageUrl:
 *   1. Downloads the image (stripping f_webp/ transform to get original)
 *   2. Uploads it to Sanity as a native image asset
 *   3. Prepends the uploaded asset to the product's images[] array (position 0)
 *   4. Unsets the cloudinaryImageUrl field
 *
 * Usage:
 *   npx tsx scripts/migrate-cloudinary-to-sanity.ts --dry-run   # preview
 *   npx tsx scripts/migrate-cloudinary-to-sanity.ts              # execute
 */

import { sanityClient } from './lib/sanity-client'

const DRY_RUN = process.argv.includes('--dry-run')

interface ProductWithCloudinary {
  _id: string
  name: string
  cloudinaryImageUrl: string
  images: { _key: string }[] | null
}

async function fetchProductsWithCloudinary(): Promise<ProductWithCloudinary[]> {
  return sanityClient.fetch(
    `*[_type == "product" && defined(cloudinaryImageUrl) && cloudinaryImageUrl != ""] {
      _id,
      name,
      cloudinaryImageUrl,
      "images": images[] { _key }
    }`
  )
}

function getOriginalUrl(cloudinaryUrl: string): string {
  // Strip f_webp/ transform segment to get the original (typically PNG)
  // e.g. .../f_webp/v1234/... → .../v1234/...
  return cloudinaryUrl.replace(/\/f_webp\//, '/')
}

function generateKey(): string {
  return Math.random().toString(36).slice(2, 10)
}

async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  }
  const contentType = response.headers.get('content-type') || 'image/png'
  const arrayBuffer = await response.arrayBuffer()
  return { buffer: Buffer.from(arrayBuffer), contentType }
}

function filenameFromUrl(url: string, productName: string): string {
  // Try to extract a meaningful filename from the URL path
  const urlPath = new URL(url).pathname
  const segments = urlPath.split('/')
  const lastSegment = segments[segments.length - 1]

  if (lastSegment && /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(lastSegment)) {
    return lastSegment
  }

  // Fall back to a slugified product name
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
  return `${slug}.png`
}

async function migrateProduct(product: ProductWithCloudinary): Promise<boolean> {
  const originalUrl = getOriginalUrl(product.cloudinaryImageUrl)
  const filename = filenameFromUrl(originalUrl, product.name)

  console.log(`  Downloading: ${originalUrl}`)
  const { buffer, contentType } = await downloadImage(originalUrl)
  console.log(`  Downloaded ${(buffer.length / 1024).toFixed(1)} KB (${contentType})`)

  console.log(`  Uploading to Sanity as "${filename}"...`)
  const asset = await sanityClient.assets.upload('image', buffer, {
    filename,
    contentType,
  })
  console.log(`  Uploaded: ${asset._id}`)

  // Build the new image array entry
  const newImageEntry = {
    _type: 'image',
    _key: generateKey(),
    asset: {
      _type: 'reference',
      _ref: asset._id,
    },
  }

  // Prepend to images array and unset cloudinaryImageUrl
  await sanityClient
    .patch(product._id)
    .setIfMissing({ images: [] })
    .insert('before', 'images[0]', [newImageEntry])
    .unset(['cloudinaryImageUrl'])
    .commit()

  console.log(`  Patched product: prepended image, unset cloudinaryImageUrl`)
  return true
}

async function main() {
  console.log('=== Cloudinary → Sanity Image Migration ===')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`)
  console.log()

  const products = await fetchProductsWithCloudinary()
  console.log(`Found ${products.length} products with cloudinaryImageUrl\n`)

  if (products.length === 0) {
    console.log('Nothing to migrate.')
    return
  }

  if (DRY_RUN) {
    console.log('Products that would be migrated:')
    for (const p of products) {
      const existingCount = p.images?.length ?? 0
      console.log(`  - ${p.name} (${p._id})`)
      console.log(`    Cloudinary: ${p.cloudinaryImageUrl}`)
      console.log(`    Original:   ${getOriginalUrl(p.cloudinaryImageUrl)}`)
      console.log(`    Existing Sanity images: ${existingCount}`)
    }
    console.log(`\nRun without --dry-run to execute migration.`)
    return
  }

  let success = 0
  let failed = 0

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    console.log(`[${i + 1}/${products.length}] ${product.name} (${product._id})`)

    try {
      await migrateProduct(product)
      success++
    } catch (err) {
      console.error(`  FAILED: ${err}`)
      failed++
    }

    console.log()
  }

  console.log('=== Migration Summary ===')
  console.log(`  Total:   ${products.length}`)
  console.log(`  Success: ${success}`)
  console.log(`  Failed:  ${failed}`)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
