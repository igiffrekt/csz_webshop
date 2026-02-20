/**
 * Migrate existing productVariant documents:
 * Copy attributeLabel/attributeValue into the new attributes[] array.
 *
 * Run: SANITY_TOKEN=<token> node scripts/migrate-variant-attributes.mjs
 */

const PROJECT_ID = '7xz4a7fm'
const DATASET = 'production'
const API_VERSION = '2025-01-01'
const TOKEN = process.env.SANITY_TOKEN

if (!TOKEN) {
  console.error('Set SANITY_TOKEN env var')
  process.exit(1)
}

async function query(groq) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })
  const data = await res.json()
  return data.result
}

async function main() {
  // Get all variants that have attributeLabel/attributeValue but no attributes array
  const variants = await query(
    '*[_type == "productVariant" && defined(attributeLabel) && defined(attributeValue)]{ _id, name, attributeLabel, attributeValue, attributes }'
  )

  const needMigration = variants.filter(
    (v) => !v.attributes || v.attributes.length === 0
  )

  console.log(
    `Found ${variants.length} variants with old fields, ${needMigration.length} need migration`
  )

  if (needMigration.length === 0) {
    console.log('All variants already migrated!')
    return
  }

  const mutations = []
  for (const v of needMigration) {
    mutations.push({
      patch: {
        id: v._id,
        set: {
          attributes: [
            {
              _key: crypto.randomUUID().slice(0, 12),
              label: v.attributeLabel,
              value: v.attributeValue,
            },
          ],
        },
      },
    })
    console.log(
      `  ${v._id}: "${v.name}" -> attributes: [{ label: "${v.attributeLabel}", value: "${v.attributeValue}" }]`
    )
  }

  // Send mutations
  const res = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ mutations }),
    }
  )
  const result = await res.json()
  if (result.error) {
    console.error('Error:', result.error)
  } else {
    console.log(`Migrated ${mutations.length} variants successfully!`)
  }
}

main().catch(console.error)
