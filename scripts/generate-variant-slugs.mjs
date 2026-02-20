/**
 * Generate slugs for all productVariant documents that don't have one.
 * Run: SANITY_TOKEN=<token> node scripts/generate-variant-slugs.mjs
 */

const PROJECT_ID = '7xz4a7fm'
const DATASET = 'production'
const API_VERSION = '2025-01-01'
const TOKEN = process.env.SANITY_TOKEN

if (!TOKEN) {
  console.error('Set SANITY_TOKEN env var')
  process.exit(1)
}

const HUN_MAP = {
  á: 'a', é: 'e', í: 'i', ó: 'o', ö: 'o', ő: 'o', ú: 'u', ü: 'u', ű: 'u',
  Á: 'a', É: 'e', Í: 'i', Ó: 'o', Ö: 'o', Ő: 'o', Ú: 'u', Ü: 'u', Ű: 'u',
}

function hunSlugify(input) {
  return input
    .split('')
    .map((ch) => HUN_MAP[ch] || ch)
    .join('')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200)
}

async function query(groq) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })
  const data = await res.json()
  return data.result
}

async function main() {
  // Get all variants without a slug
  const variants = await query('*[_type == "productVariant"]{ _id, name, slug }')

  const needSlugs = variants.filter(v => !v.slug?.current)
  console.log(`Found ${variants.length} variants total, ${needSlugs.length} need slugs`)

  if (needSlugs.length === 0) {
    console.log('All variants already have slugs!')
    return
  }

  // Collect all existing slugs to avoid duplicates
  const existingSlugs = new Set(
    variants.filter(v => v.slug?.current).map(v => v.slug.current)
  )

  const mutations = []
  for (const v of needSlugs) {
    let baseSlug = hunSlugify(v.name || 'variant')
    let slug = baseSlug
    let counter = 1
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    existingSlugs.add(slug)

    mutations.push({
      patch: {
        id: v._id,
        set: { slug: { _type: 'slug', current: slug } },
      },
    })
    console.log(`  ${v._id}: "${v.name}" -> ${slug}`)
  }

  // Send mutations in batches of 50
  const batchSize = 50
  for (let i = 0; i < mutations.length; i += batchSize) {
    const batch = mutations.slice(i, i + batchSize)
    const res = await fetch(
      `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ mutations: batch }),
      }
    )
    const result = await res.json()
    if (result.error) {
      console.error('Error:', result.error)
    } else {
      console.log(`Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} variants updated`)
    }
  }

  console.log('Done!')
}

main().catch(console.error)
