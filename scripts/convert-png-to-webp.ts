/**
 * Convert PNG image assets to WebP in Sanity.
 *
 * For each product image that is a PNG:
 *   1. Downloads the original PNG from Sanity CDN
 *   2. Converts to WebP using sharp
 *   3. Uploads the WebP as a new Sanity asset
 *   4. Replaces the asset reference on the product
 *   5. Deletes the old PNG asset
 *
 * Usage:
 *   npx tsx scripts/convert-png-to-webp.ts --dry-run   # preview
 *   npx tsx scripts/convert-png-to-webp.ts              # execute
 */

import sharp from 'sharp'
import { sanityClient } from './lib/sanity-client'

const DRY_RUN = process.argv.includes('--dry-run')

interface ImageEntry {
  _key: string
  assetId: string
  url: string
  mimeType: string
  originalFilename: string | null
  size: number
}

interface ProductWithImages {
  _id: string
  name: string
  images: ImageEntry[]
}

async function fetchProductsWithPngImages(): Promise<ProductWithImages[]> {
  return sanityClient.fetch(
    `*[_type == "product" && count(images) > 0] {
      _id,
      name,
      "images": images[] {
        _key,
        "assetId": asset._ref,
        "url": asset->url,
        "mimeType": asset->mimeType,
        "originalFilename": asset->originalFilename,
        "size": asset->size
      }
    }`
  )
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

async function convertToWebp(pngBuffer: Buffer): Promise<Buffer> {
  return sharp(pngBuffer)
    .webp({ quality: 85 })
    .toBuffer()
}

function webpFilename(original: string | null): string {
  if (!original) return 'image.webp'
  return original.replace(/\.(png|jpg|jpeg|gif|bmp|tiff?)$/i, '.webp')
}

async function main() {
  console.log('=== PNG → WebP Conversion ===')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}\n`)

  const products = await fetchProductsWithPngImages()

  // Collect all PNG images across products
  const pngEntries: { product: ProductWithImages; image: ImageEntry }[] = []

  for (const product of products) {
    for (const img of product.images) {
      if (!img.url) continue
      const isPng = img.mimeType === 'image/png' || img.url.endsWith('.png')
      if (isPng) {
        pngEntries.push({ product, image: img })
      }
    }
  }

  console.log(`Found ${pngEntries.length} PNG images across ${products.length} products\n`)

  if (pngEntries.length === 0) {
    console.log('Nothing to convert.')
    return
  }

  // Deduplicate by asset ID — multiple products can share the same asset
  const uniqueAssets = new Map<string, { assetId: string; url: string; mimeType: string; originalFilename: string | null; size: number }>()
  for (const entry of pngEntries) {
    if (!uniqueAssets.has(entry.image.assetId)) {
      uniqueAssets.set(entry.image.assetId, entry.image)
    }
  }

  console.log(`Unique PNG assets to convert: ${uniqueAssets.size}\n`)

  if (DRY_RUN) {
    let totalSize = 0
    for (const [assetId, img] of uniqueAssets) {
      const refs = pngEntries.filter(e => e.image.assetId === assetId)
      const productNames = [...new Set(refs.map(r => r.product.name))]
      console.log(`  ${assetId}`)
      console.log(`    File: ${img.originalFilename || '(unknown)'} — ${(img.size / 1024).toFixed(1)} KB`)
      console.log(`    Used by: ${productNames.join(', ')}`)
      totalSize += img.size
    }
    console.log(`\nTotal PNG size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Run without --dry-run to execute conversion.`)
    return
  }

  // Phase 1: Convert each unique PNG asset → WebP, build old→new mapping
  const assetMapping = new Map<string, string>() // old assetId → new assetId
  let converted = 0
  let failed = 0
  let savedBytes = 0

  for (const [assetId, img] of uniqueAssets) {
    const idx = converted + failed + 1
    console.log(`[${idx}/${uniqueAssets.size}] ${img.originalFilename || assetId}`)

    try {
      // Download
      const pngBuffer = await downloadImage(img.url)
      console.log(`  Downloaded: ${(pngBuffer.length / 1024).toFixed(1)} KB`)

      // Convert
      const webpBuffer = await convertToWebp(pngBuffer)
      const saving = pngBuffer.length - webpBuffer.length
      savedBytes += saving
      console.log(`  Converted:  ${(webpBuffer.length / 1024).toFixed(1)} KB (saved ${(saving / 1024).toFixed(1)} KB — ${Math.round((saving / pngBuffer.length) * 100)}%)`)

      // Upload new WebP asset
      const filename = webpFilename(img.originalFilename)
      const newAsset = await sanityClient.assets.upload('image', webpBuffer, {
        filename,
        contentType: 'image/webp',
      })
      console.log(`  Uploaded:   ${newAsset._id}`)

      assetMapping.set(assetId, newAsset._id)
      converted++
    } catch (err) {
      console.error(`  FAILED: ${err}`)
      failed++
    }
  }

  console.log(`\n--- Asset conversion done: ${converted} converted, ${failed} failed ---`)
  console.log(`Total saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB\n`)

  // Phase 2: Update product references
  console.log('--- Updating product references ---\n')
  let patchedProducts = 0

  for (const product of products) {
    const needsPatch = product.images.some(img => assetMapping.has(img.assetId))
    if (!needsPatch) continue

    try {
      // Build the updated images array with new asset refs
      const updatedImages = product.images.map(img => {
        const newAssetId = assetMapping.get(img.assetId)
        if (newAssetId) {
          return {
            _type: 'image',
            _key: img._key,
            asset: { _type: 'reference', _ref: newAssetId },
          }
        }
        // Keep existing reference unchanged
        return {
          _type: 'image',
          _key: img._key,
          asset: { _type: 'reference', _ref: img.assetId },
        }
      })

      await sanityClient
        .patch(product._id)
        .set({ images: updatedImages })
        .commit()

      patchedProducts++
      console.log(`  Patched: ${product.name}`)
    } catch (err) {
      console.error(`  FAILED to patch ${product.name}: ${err}`)
    }
  }

  console.log(`\nPatched ${patchedProducts} products`)

  // Phase 3: Delete old PNG assets
  console.log('\n--- Deleting old PNG assets ---\n')
  let deleted = 0

  for (const [oldAssetId] of assetMapping) {
    try {
      await sanityClient.delete(oldAssetId)
      deleted++
    } catch (err) {
      // Asset might still be referenced elsewhere — that's okay
      console.error(`  Could not delete ${oldAssetId}: ${err}`)
    }
  }

  console.log(`Deleted ${deleted}/${assetMapping.size} old PNG assets`)

  // Summary
  console.log('\n=== Conversion Summary ===')
  console.log(`  PNG assets converted: ${converted}`)
  console.log(`  Products patched:     ${patchedProducts}`)
  console.log(`  Old assets deleted:   ${deleted}`)
  console.log(`  Space saved:          ${(savedBytes / 1024 / 1024).toFixed(2)} MB`)
  console.log(`  Failures:             ${failed}`)
}

main().catch((err) => {
  console.error('Conversion failed:', err)
  process.exit(1)
})
