/**
 * Sets random stock numbers (5-120) on all products and variants in Sanity.
 *
 * Usage: node scripts/randomize-stock.mjs
 * Requires SANITY_TOKEN env var with a write-access token.
 */

const PROJECT_ID = '7xz4a7fm'
const DATASET = 'production'
const API_VERSION = '2025-01-01'
const TOKEN = process.env.SANITY_TOKEN

if (!TOKEN) {
  console.error('Set SANITY_TOKEN env var with a write-access Sanity token')
  process.exit(1)
}

const BASE = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}`

async function query(groq) {
  const url = `${BASE}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })
  const data = await res.json()
  return data.result
}

async function mutate(mutations) {
  const res = await fetch(`${BASE}/data/mutate/${DATASET}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  })
  return res.json()
}

function randomStock() {
  return Math.floor(Math.random() * 116) + 5 // 5-120
}

async function main() {
  // Get all products
  const products = await query('*[_type == "product"]{_id}')
  console.log(`Found ${products.length} products`)

  // Get all variants
  const variants = await query('*[_type == "productVariant"]{_id}')
  console.log(`Found ${variants.length} variants`)

  // Build mutations
  const mutations = []

  for (const doc of [...products, ...variants]) {
    mutations.push({
      patch: {
        id: doc._id,
        set: { stock: randomStock() },
      },
    })
  }

  // Execute in batches of 100
  const BATCH_SIZE = 100
  for (let i = 0; i < mutations.length; i += BATCH_SIZE) {
    const batch = mutations.slice(i, i + BATCH_SIZE)
    const result = await mutate(batch)
    if (result.error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} error:`, result.error)
    } else {
      console.log(`Batch ${i / BATCH_SIZE + 1}: updated ${batch.length} documents`)
    }
  }

  console.log('Done! All stock numbers randomized.')
}

main().catch(console.error)
