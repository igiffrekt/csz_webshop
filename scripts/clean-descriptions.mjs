/**
 * Clean encoding artifacts (%%P%%, %%/P%%, %%H1%%, etc.) from product descriptions in Sanity.
 *
 * Usage: node scripts/clean-descriptions.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env from apps/web/.env.local
const envPath = resolve(__dirname, '../apps/web/.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
    })
)

const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const TOKEN = env.SANITY_API_WRITE_TOKEN
const API_VERSION = '2025-01-01'

const BASE_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data`

// Pattern to match all encoding artifacts
const ARTIFACT_REGEX = /%%\/?P%%|%%\/?H\d?%%|%%\/?LI%%|%%\/?UL%%|%%\/?OL%%|%%\/?STRONG%%|%%\/?EM%%|%%\/?BR%%|%%\/?A%%|%%\/?SPAN%%|%%\/?DIV%%|%%\/?BLOCKQUOTE%%/gi

async function sanityFetch(query) {
  const url = `${BASE_URL}/query/${DATASET}?query=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  const data = await res.json()
  return data.result
}

async function sanityMutate(mutations) {
  const url = `${BASE_URL}/mutate/${DATASET}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Sanity mutation failed: ${res.status} ${text}`)
  }
  return res.json()
}

function cleanText(text) {
  return text.replace(ARTIFACT_REGEX, '').trim()
}

async function main() {
  console.log('Fetching all products with descriptions...')

  const products = await sanityFetch(
    `*[_type == "product" && defined(description)]{_id, name, description}`
  )

  console.log(`Found ${products.length} products with descriptions.`)

  let cleanedCount = 0
  let totalArtifacts = 0
  const mutations = []

  for (const product of products) {
    if (!product.description || !Array.isArray(product.description)) continue

    let needsUpdate = false
    const cleanedDescription = product.description.map(block => {
      if (block._type !== 'block' || !block.children) return block

      const cleanedChildren = block.children.map(child => {
        if (!child.text) return child

        ARTIFACT_REGEX.lastIndex = 0
        if (ARTIFACT_REGEX.test(child.text)) {
          ARTIFACT_REGEX.lastIndex = 0
          const matches = child.text.match(ARTIFACT_REGEX)
          totalArtifacts += matches ? matches.length : 0
          needsUpdate = true
          return { ...child, text: cleanText(child.text) }
        }
        return child
      })

      return { ...block, children: cleanedChildren }
    })

    // Filter out empty blocks after cleaning
    const filteredDescription = cleanedDescription.filter(block => {
      if (block._type !== 'block') return true
      return block.children.some(child => child.text && child.text.trim().length > 0)
    })

    if (needsUpdate) {
      cleanedCount++
      console.log(`  Cleaning: ${product.name} (${product._id})`)
      mutations.push({
        patch: {
          id: product._id,
          set: { description: filteredDescription },
        },
      })
    }
  }

  if (mutations.length > 0) {
    // Batch in groups of 50
    for (let i = 0; i < mutations.length; i += 50) {
      const batch = mutations.slice(i, i + 50)
      console.log(`  Patching batch ${Math.floor(i / 50) + 1}...`)
      await sanityMutate(batch)
    }
  }

  console.log(`\nDone! Cleaned ${cleanedCount} products, removed ${totalArtifacts} artifacts.`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
