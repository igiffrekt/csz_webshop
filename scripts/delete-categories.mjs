/**
 * Deletes all categories from Sanity without affecting products.
 * Step 1: Remove category references from all products
 * Step 2: Delete all category documents (published + drafts)
 *
 * Usage: node scripts/delete-categories.mjs
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

async function query(groq, params = {}) {
  const url = new URL(`${BASE}/data/query/${DATASET}`)
  url.searchParams.set('query', groq)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(`$${k}`, JSON.stringify(v))
  }
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
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Mutation failed: ${res.status} ${err}`)
  }
  return res.json()
}

async function main() {
  // Step 1: Remove category references from all products
  console.log('Step 1: Removing category references from products...')
  const products = await query('*[_type == "product" && defined(categories) && length(categories) > 0]{_id}')
  console.log(`  Found ${products.length} products with categories`)

  if (products.length > 0) {
    // Batch in groups of 50
    for (let i = 0; i < products.length; i += 50) {
      const batch = products.slice(i, i + 50)
      const mutations = batch.map((p) => ({
        patch: {
          id: p._id,
          unset: ['categories'],
        },
      }))
      await mutate(mutations)
      console.log(`  Cleared categories from ${Math.min(i + 50, products.length)}/${products.length} products`)
    }
  }

  // Step 2: Delete all categories (published + drafts)
  console.log('\nStep 2: Deleting all categories...')
  const categories = await query('*[_type == "category"]{_id}')
  console.log(`  Found ${categories.length} categories to delete`)

  if (categories.length > 0) {
    for (let i = 0; i < categories.length; i += 50) {
      const batch = categories.slice(i, i + 50)
      const mutations = batch.flatMap((c) => [
        { delete: { id: c._id } },
        { delete: { id: `drafts.${c._id}` } },
      ])
      await mutate(mutations)
      console.log(`  Deleted ${Math.min(i + 50, categories.length)}/${categories.length} categories`)
    }
  }

  console.log('\nDone! All categories deleted, products untouched.')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
