/**
 * Migration script: WooCommerce → Sanity
 *
 * Fetches all products and categories from WooCommerce and imports them
 * into Sanity, along with static content (pages, FAQs, homepage, menu items).
 *
 * Usage: npx tsx scripts/migrate-to-sanity.ts
 *
 * Required env vars (in apps/web/.env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_API_WRITE_TOKEN
 *   WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { htmlToPortableText, textToPortableText, resetKeyCounter } from './lib/portable-text'

// Load env
config({ path: resolve(__dirname, '../apps/web/.env.local') })

// We import @sanity/client directly rather than the lib to avoid extra dependency issues
import { createClient, type SanityDocument } from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN!,
})

// ---------------------------------------------------------------------------
// WooCommerce types & helpers
// ---------------------------------------------------------------------------

interface WooCategory {
  id: number
  name: string
  slug: string
  parent: number
  description: string
  count: number
  image: { src: string; alt: string } | null
}

interface WooProduct {
  id: number
  name: string
  slug: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  description: string
  short_description: string
  stock_status: string
  stock_quantity: number | null
  weight: string
  featured: boolean
  images: { src: string; alt: string }[]
  categories: { id: number; name: string; slug: string }[]
}

const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET

async function wooFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${WOOCOMMERCE_URL}/wp-json/wc/v3${endpoint}`)
  url.searchParams.set('consumer_key', CONSUMER_KEY!)
  url.searchParams.set('consumer_secret', CONSUMER_SECRET!)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function fetchAllWooCategories(): Promise<WooCategory[]> {
  const all: WooCategory[] = []
  let page = 1
  while (true) {
    const batch = await wooFetch<WooCategory[]>('/products/categories', {
      per_page: '100',
      page: String(page),
    })
    if (batch.length === 0) break
    all.push(...batch)
    page++
    console.log(`  Fetched ${all.length} categories...`)
  }
  return all
}

async function fetchAllWooProducts(): Promise<WooProduct[]> {
  const all: WooProduct[] = []
  let page = 1
  while (true) {
    const batch = await wooFetch<WooProduct[]>('/products', {
      per_page: '100',
      page: String(page),
    })
    if (batch.length === 0) break
    all.push(...batch)
    page++
    console.log(`  Fetched ${all.length} products...`)
  }
  return all
}

// ---------------------------------------------------------------------------
// Cloudinary URL lookup
// ---------------------------------------------------------------------------

interface CloudinaryEntry {
  product_id: string
  product_name: string
  original_url: string
  cloudinary_url: string
}

let cloudinaryMap: Map<string, string> | null = null

function loadCloudinaryUrls(): Map<string, string> {
  if (cloudinaryMap) return cloudinaryMap

  const raw = readFileSync(resolve(__dirname, 'cloudinary-urls.json'), 'utf-8')
  const entries: CloudinaryEntry[] = JSON.parse(raw)

  // Build a map keyed by normalized product name for fuzzy matching
  cloudinaryMap = new Map<string, string>()
  for (const entry of entries) {
    // Store by normalized name (lowercase, trimmed)
    const key = entry.product_name.toLowerCase().trim()
    cloudinaryMap.set(key, entry.cloudinary_url)
  }
  return cloudinaryMap
}

function findCloudinaryUrl(productName: string): string | undefined {
  const map = loadCloudinaryUrls()

  // Exact match by lowercased name
  const key = productName.toLowerCase().trim()
  if (map.has(key)) return map.get(key)

  // Try matching by prefix (Cloudinary entries have truncated names)
  for (const [mapKey, url] of map) {
    if (key.startsWith(mapKey) || mapKey.startsWith(key)) {
      return url
    }
  }

  return undefined
}

// ---------------------------------------------------------------------------
// Sanity batch helpers
// ---------------------------------------------------------------------------

const BATCH_SIZE = 50
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function batchCreateOrReplace(docs: Record<string, unknown>[]): Promise<void> {
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE)
    const tx = sanityClient.transaction()
    for (const doc of batch) {
      tx.createOrReplace(doc as unknown as SanityDocument)
    }
    await tx.commit()
    console.log(`  Committed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(docs.length / BATCH_SIZE)}`)
    await delay(200)
  }
}

// ---------------------------------------------------------------------------
// Category migration
// ---------------------------------------------------------------------------

async function migrateCategories(wooCategories: WooCategory[]): Promise<Map<number, string>> {
  console.log('\n--- Migrating categories ---')
  const wooIdToSanityId = new Map<number, string>()

  // First pass: create all categories without parent references
  const categoryDocs: Record<string, unknown>[] = []
  for (const cat of wooCategories) {
    const sanityId = `cat-${cat.slug}`
    wooIdToSanityId.set(cat.id, sanityId)

    categoryDocs.push({
      _id: sanityId,
      _type: 'category',
      name: cat.name,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description || undefined,
      productCount: cat.count,
    })
  }

  console.log(`  Creating ${categoryDocs.length} categories (pass 1: no parents)...`)
  await batchCreateOrReplace(categoryDocs)

  // Second pass: patch parent references
  console.log('  Setting parent references (pass 2)...')
  const parentPatches = wooCategories.filter((c) => c.parent !== 0)
  for (const cat of parentPatches) {
    const sanityId = wooIdToSanityId.get(cat.id)
    const parentSanityId = wooIdToSanityId.get(cat.parent)
    if (sanityId && parentSanityId) {
      await sanityClient.patch(sanityId).set({ parent: { _type: 'reference', _ref: parentSanityId } }).commit()
    }
  }
  console.log(`  Set ${parentPatches.length} parent references.`)

  return wooIdToSanityId
}

// ---------------------------------------------------------------------------
// Product migration
// ---------------------------------------------------------------------------

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

async function migrateProducts(
  wooProducts: WooProduct[],
  categoryMap: Map<number, string>
): Promise<void> {
  console.log('\n--- Migrating products ---')

  const productDocs: Record<string, unknown>[] = []

  for (const prod of wooProducts) {
    resetKeyCounter()

    const sanityId = `prod-${prod.slug}`

    // Parse prices (WooCommerce stores as strings in the store currency, HUF = integer)
    const price = Math.round(parseFloat(prod.price || '0'))
    const regularPrice = Math.round(parseFloat(prod.regular_price || '0'))
    const salePrice = Math.round(parseFloat(prod.sale_price || '0'))

    const basePrice = price || regularPrice || 0
    const compareAtPrice =
      salePrice > 0 && regularPrice > salePrice ? regularPrice : undefined
    const isOnSale = salePrice > 0 && salePrice < regularPrice

    // Category references
    const categories = prod.categories
      .map((c) => {
        const ref = categoryMap.get(c.id)
        return ref ? { _type: 'reference', _ref: ref, _key: `ref-${c.id}` } : null
      })
      .filter(Boolean)

    // Description → Portable Text
    const description = prod.description
      ? htmlToPortableText(prod.description)
      : undefined

    // Short description → plain text
    const shortDescription = prod.short_description
      ? stripHtmlTags(prod.short_description).substring(0, 300)
      : undefined

    // Cloudinary URL
    const cloudinaryImageUrl = findCloudinaryUrl(prod.name)

    productDocs.push({
      _id: sanityId,
      _type: 'product',
      name: prod.name,
      slug: { _type: 'slug', current: prod.slug },
      sku: prod.sku || `WOO-${prod.id}`,
      description,
      shortDescription,
      basePrice,
      compareAtPrice,
      stock: prod.stock_quantity ?? (prod.stock_status === 'instock' ? 999 : 0),
      weight: prod.weight ? parseFloat(prod.weight) : undefined,
      isFeatured: prod.featured || false,
      isOnSale,
      cloudinaryImageUrl,
      categories: categories.length > 0 ? categories : undefined,
    })
  }

  console.log(`  Creating ${productDocs.length} products...`)
  await batchCreateOrReplace(productDocs)
}

// ---------------------------------------------------------------------------
// Static content: Pages
// ---------------------------------------------------------------------------

function createPages(): Record<string, unknown>[] {
  resetKeyCounter()
  return [
    {
      _id: 'page-rolunk',
      _type: 'page',
      title: 'Rolunk',
      slug: { _type: 'slug', current: 'rolunk' },
      content: textToPortableText(
        `A CSZ Tuzvedelem Kft. tobb mint 20 eve a magyar tuzvedelmi piac meghatározo szereploje. Cegiink tuzvedelmi eszkozok es berendezesek forgalmazasaval, karbantartasaval foglalkozik.\n\nSzeles termekpalettankon megtalalhatok a tuzolto keszulekek, tuzcsapszekrenyek, tuzolto tomlokapacsok, sugarcsorvek es egyeb tuzvedelmi felszerelesek.\n\nCelunk, hogy ugyfeleinket a legjobb minosegu tuzvedelmi termekekkel lassuk el, versenykepesaron, gyors kiszallitassal.`
      ),
      seo: {
        _type: 'seo',
        metaTitle: 'Rolunk - CSZ Tuzvedelem',
        metaDescription: 'A CSZ Tuzvedelem Kft. tobb mint 20 eve a magyar tuzvedelmi piac meghatározo szereploje.',
      },
    },
    {
      _id: 'page-aszf',
      _type: 'page',
      title: 'Altalanos Szerzodesi Feltetelek',
      slug: { _type: 'slug', current: 'aszf' },
      content: textToPortableText(
        `Az Altalanos Szerzodesi Feltetelek (ASZF) a CSZ Tuzvedelem Kft. altal uzemeitetett csz-tuzvedelem.hu weboldalon torteno vasarlasra vonatkoznak.\n\nA weboldalon torteno megrendeles elektronikus uton megkotott szerzodes, amelyre az elektronikus kereskedelmi szolgaltatasok, valamint az informacios tarsadalommal osszefuggo szolgaltatasok egyes kerdeseirol szolo 2001. evi CVIII. torveny rendelkezesi az iranyoadok.\n\nA vasarlasi szerzodes a megrendeles visszaigazolasaval jon letre. A termekek ara magyar forintban (HUF) van feltuntetve es tartalmazza az AFA-t.`
      ),
      seo: {
        _type: 'seo',
        metaTitle: 'ASZF - CSZ Tuzvedelem',
        metaDescription: 'A CSZ Tuzvedelem Kft. Altalanos Szerzodesi Feltetelei.',
      },
    },
    {
      _id: 'page-adatvedelem',
      _type: 'page',
      title: 'Adatvedelmi Tajekoztato',
      slug: { _type: 'slug', current: 'adatvedelem' },
      content: textToPortableText(
        `A CSZ Tuzvedelem Kft. (tovabbiakban: Adatkezelo) az Europai Parlament es a Tanacs (EU) 2016/679 szamu altalanos adatvedelmi rendeleteben (GDPR) foglaltaknak megfeleloen kezeli az On szemelyeses adatait.\n\nAz adatkezeles celja a webshopban torteno vasarlas lebonyolitasa, a megrendelt termekek kiszallitasa es a szamla kiallitasa.\n\nAz adatkezeles jogalapja az On hozzajarulasa, valamint a szerzodes teljesitese. Az On adatait harmadik feleknek nem adjuk at, kivetel a kiszallitast vegzo partner.`
      ),
      seo: {
        _type: 'seo',
        metaTitle: 'Adatvedelmi Tajekoztato - CSZ Tuzvedelem',
        metaDescription: 'A CSZ Tuzvedelem Kft. adatvedelmi tajekoztato es GDPR szabalyzat.',
      },
    },
    {
      _id: 'page-visszaterites',
      _type: 'page',
      title: 'Visszateritesi Szabalyzat',
      slug: { _type: 'slug', current: 'visszaterites' },
      content: textToPortableText(
        `A tavollevok kozott kotott szerzdesekrol szolo 45/2014. (II.26.) Korm. rendelet ertelmeben a fogyaszto a termek kezhezvetetelet kovetoen 14 napon belul indokolás nelkul elallhat a szerzodestol.\n\nAz elallasi jog gyakorlasa eseten a fogyaszto koteles a terméket haladektalanul, de legkesobb az elallasi szandekat koveto 14 napon belul visszakuldeni.\n\nA visszakuldes koltsege a fogyasztot terheli. A visszaterítés a termek visszaerkezesetol szamitott 14 napon belul tortenik az eredeti fizetesi modon.`
      ),
      seo: {
        _type: 'seo',
        metaTitle: 'Visszateritesi Szabalyzat - CSZ Tuzvedelem',
        metaDescription: 'A CSZ Tuzvedelem Kft. visszateritesi es elallasi szabalyzata.',
      },
    },
  ]
}

// ---------------------------------------------------------------------------
// Static content: FAQs
// ---------------------------------------------------------------------------

function createFaqs(): Record<string, unknown>[] {
  resetKeyCounter()
  return [
    {
      _id: 'faq-szallitas-ido',
      _type: 'faq',
      question: 'Mennyi ido a szallitas?',
      answer: textToPortableText(
        'A megrendelt termekeket altalaban 2-5 munkanap alatt szallitjuk ki. Raktaron levo termekek eseten a szallitas 1-2 munkanapon belul megtortenik. Egyedi vagy kulonleges termekek eseten a szallitasi ido hosszabb lehet.'
      ),
      order: 1,
      category: 'Szallitas',
    },
    {
      _id: 'faq-szallitas-koltseg',
      _type: 'faq',
      question: 'Mennyibe kerul a szallitas?',
      answer: textToPortableText(
        'A szallitasi koltseg a megrendeles osszertekétol es a csomag sulyanal fugg. 50 000 Ft feletti megrendeles eseten a szallitas ingyenes. Az aktualis szallitasi dijakat a penztarnal lathatja.'
      ),
      order: 2,
      category: 'Szallitas',
    },
    {
      _id: 'faq-fizetes-modok',
      _type: 'faq',
      question: 'Milyen fizetesi modok erhetek el?',
      answer: textToPortableText(
        'Elfogadjuk a bankkartyas fizetes (Stripe), az utanveteles fizetes es az eloreatutalas lehetoseget. Ceges vasarlok reszere szamla elleneben torteno fizetesi lehetoseget is biztositunk.'
      ),
      order: 3,
      category: 'Fizetes',
    },
    {
      _id: 'faq-szamla',
      _type: 'faq',
      question: 'Kapok-e szamlat a vasarlasrol?',
      answer: textToPortableText(
        'Igen, minden vasarlasrol elektronikus szamlat allitunk ki, amelyet e-mailben kuldunk el. Ceges vasarlok reszere ÁFA-s szamlat allitunk ki a megadott ceges adatok alapjan.'
      ),
      order: 4,
      category: 'Fizetes',
    },
    {
      _id: 'faq-garancia',
      _type: 'faq',
      question: 'Van garancia a termekekre?',
      answer: textToPortableText(
        'Minden termekunkre a torveny altal elcirt jotallast biztositjuk. A tuzvedelmi eszkozokre altalaban 1-2 ev garanciat vallalunk. A pontos garanciaidot az adott termek adatlapjan talaja.'
      ),
      order: 5,
      category: 'Garancia',
    },
    {
      _id: 'faq-visszakuldes',
      _type: 'faq',
      question: 'Hogyan kuldhetek vissza egy terméket?',
      answer: textToPortableText(
        'A termek kézhezvételétol szamitott 14 napon belul elallasi jogaval elhet. A visszakuldest postai vagy futarszolgalaton keresztul teheti meg. Kerem vegye fel velunk a kapcsolatot a visszakuldes elott, hogy egyeztessuk a reszleteket.'
      ),
      order: 6,
      category: 'Garancia',
    },
    {
      _id: 'faq-ceges-vasarlas',
      _type: 'faq',
      question: 'Tudok ceges szamlara vasarolni?',
      answer: textToPortableText(
        'Igen, ceges vasarlok reszere biztositunk ceges szamlat. A megrendeles soran adja meg a ceg nevét, adoszamat es szeklyelyet. Nagyobb tetelu megrendelesek eseten kedvezmenyes aron tudjuk kiszolgalni.'
      ),
      order: 7,
      category: 'Fizetes',
    },
    {
      _id: 'faq-ajanlatkeres',
      _type: 'faq',
      question: 'Hogyan kerhetek ajanlatot nagyobb tetelu megrendelesre?',
      answer: textToPortableText(
        'Nagyobb tetelu megrendelesekre egyedi ajanlatot keszitunk. Hasznaja weboldalunkon az "Ajanlat keres" funkciot, vagy keressen minket e-mailben. Az ajanlatot 1-2 munkanapon belul kuldjuk el.'
      ),
      order: 8,
      category: 'Fizetes',
    },
    {
      _id: 'faq-tuzvedelmi-felulvizsgalat',
      _type: 'faq',
      question: 'Vegeznek tuzvedelmi felulvizsgalatot?',
      answer: textToPortableText(
        'Igen, cegiink tuzvedelmi felulvizsgalatot, tuzolto keszulekek karbantartasat es tuzvedelmi tanácsadast is vallal. Keressen minket telefonon vagy e-mailben a reszletekert.'
      ),
      order: 9,
      category: 'Szolgaltatasok',
    },
  ]
}

// ---------------------------------------------------------------------------
// Static content: Homepage
// ---------------------------------------------------------------------------

function createHomepage(): Record<string, unknown> {
  resetKeyCounter()
  return {
    _id: 'homepage',
    _type: 'homepage',
    heroSection: {
      title: 'Tuzvedelmi eszkozok es felszerelesek',
      subtitle: 'Professzionalis tuzvedelmi megoldasok tobb mint 20 eve. Tuzolto keszulekek, tuzcsapszekrenyek, tomlokapacsok es egyeb felszerelesek.',
      ctaText: 'Termekek bongeszese',
      ctaLink: '/hu/termekek',
    },
    categoriesSection: {
      title: 'Termekkategriak',
      subtitle: 'Valogasson szeles termekkinaaltunkbol',
    },
    dealsSection: {
      title: 'Aktualis akciok',
      subtitle: 'Kedvezmenyes tuzvedelmi termekek',
    },
    faqSection: {
      title: 'Gyakran Ismetelt Kerdesek',
      subtitle: 'Valaszok a leggyakoribb kerdesekre',
    },
    trustBadges: [
      {
        _key: 'badge-shield',
        title: 'Minosegi garancia',
        description: 'Minden termekunk megfelel az elcirt szabvanyoknak',
        icon: 'shield',
      },
      {
        _key: 'badge-truck',
        title: 'Gyors szallitas',
        description: 'Rendeles utan 2-5 munkanapon belul',
        icon: 'truck',
      },
      {
        _key: 'badge-headphones',
        title: 'Szakertoi tamogatas',
        description: 'Segitunk a megfelelo termek kivalasztasaban',
        icon: 'headphones',
      },
    ],
    seo: {
      _type: 'seo',
      metaTitle: 'CSZ Tuzvedelem - Tuzvedelmi eszkozok webshop',
      metaDescription: 'Professzionalis tuzvedelmi eszkozok es felszerelesek webaruhaza. Tuzolto keszulekek, tuzcsapszekrenyek, tomlokapacsok kedvezo aron.',
    },
  }
}

// ---------------------------------------------------------------------------
// Static content: Menu Items
// ---------------------------------------------------------------------------

function createMenuItems(topCategoryIds: { _id: string; name: string }[]): Record<string, unknown>[] {
  resetKeyCounter()

  const items: Record<string, unknown>[] = [
    {
      _id: 'menu-termekek',
      _type: 'menuItem',
      cim: 'Termekek',
      tipus: 'url',
      url: 'https://csz-tuzvedelem.hu/hu/termekek',
      sorrend: 1,
      nyitasUjTabon: false,
      ikon: 'package',
    },
    {
      _id: 'menu-kategoriak',
      _type: 'menuItem',
      cim: 'Kategoriak',
      tipus: 'url',
      url: 'https://csz-tuzvedelem.hu/hu/kategoriak',
      sorrend: 2,
      nyitasUjTabon: false,
      ikon: 'tag',
    },
  ]

  // Add top-level categories as sub-menu items under "Kategoriak"
  topCategoryIds.forEach((cat, i) => {
    items.push({
      _id: `menu-cat-${cat._id.replace('cat-', '')}`,
      _type: 'menuItem',
      cim: cat.name,
      tipus: 'kategoria',
      kategoria: { _type: 'reference', _ref: cat._id },
      parent: { _type: 'reference', _ref: 'menu-kategoriak' },
      sorrend: i + 1,
      nyitasUjTabon: false,
    })
  })

  items.push(
    {
      _id: 'menu-rolunk',
      _type: 'menuItem',
      cim: 'Rolunk',
      tipus: 'url',
      url: 'https://csz-tuzvedelem.hu/hu/rolunk',
      sorrend: 3,
      nyitasUjTabon: false,
      ikon: 'info',
    },
    {
      _id: 'menu-kapcsolat',
      _type: 'menuItem',
      cim: 'Kapcsolat',
      tipus: 'url',
      url: 'https://csz-tuzvedelem.hu/hu/kapcsolat',
      sorrend: 4,
      nyitasUjTabon: false,
      ikon: 'mail',
    },
    {
      _id: 'menu-gyik',
      _type: 'menuItem',
      cim: 'GYIK',
      tipus: 'url',
      url: 'https://csz-tuzvedelem.hu/hu/gyik',
      sorrend: 5,
      nyitasUjTabon: false,
      ikon: 'help-circle',
    },
  )

  return items
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== WooCommerce → Sanity migration ===\n')

  // Validate Sanity credentials
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
    console.error('Missing Sanity credentials in apps/web/.env.local')
    process.exit(1)
  }
  console.log(`Sanity project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`)
  console.log(`Sanity dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`)

  // Check if WooCommerce credentials are available
  const hasWooCredentials = WOOCOMMERCE_URL && CONSUMER_KEY && CONSUMER_SECRET &&
    CONSUMER_KEY !== 'placeholder' && CONSUMER_SECRET !== 'placeholder'

  let categoryMap = new Map<number, string>()

  if (hasWooCredentials) {
    console.log(`\nWooCommerce: ${WOOCOMMERCE_URL}`)

    // Fetch data from WooCommerce
    console.log('\n--- Fetching from WooCommerce ---')
    const wooCategories = await fetchAllWooCategories()
    const wooProducts = await fetchAllWooProducts()
    console.log(`Found ${wooCategories.length} categories and ${wooProducts.length} products`)

    // Migrate categories
    categoryMap = await migrateCategories(wooCategories)

    // Migrate products
    await migrateProducts(wooProducts, categoryMap)
  } else {
    console.log('\nNo WooCommerce credentials found — skipping product/category import.')
    console.log('Set WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET in .env.local')
  }

  // Create static content (always runs)
  console.log('\n--- Creating static pages ---')
  const pages = createPages()
  await batchCreateOrReplace(pages)
  console.log(`  Created ${pages.length} pages`)

  console.log('\n--- Creating FAQs ---')
  const faqs = createFaqs()
  await batchCreateOrReplace(faqs)
  console.log(`  Created ${faqs.length} FAQs`)

  console.log('\n--- Creating homepage ---')
  const homepage = createHomepage()
  await batchCreateOrReplace([homepage])
  console.log('  Created homepage')

  console.log('\n--- Creating menu items ---')
  // Fetch top-level categories from Sanity for dynamic menu items
  let topCategories: { _id: string; name: string }[] = []
  try {
    topCategories = await sanityClient.fetch<{ _id: string; name: string }[]>(
      `*[_type == "category" && !defined(parent)]{_id, name} | order(name asc)`
    )
  } catch (err) {
    console.log('  Could not fetch categories for menu, creating menu without category sub-items')
  }
  const menuItems = createMenuItems(topCategories)
  await batchCreateOrReplace(menuItems)
  console.log(`  Created ${menuItems.length} menu items`)

  // Patch homepage with featured product references if products were imported
  if (hasWooCredentials) {
    console.log('\n--- Patching homepage with featured products ---')
    try {
      const featured = await sanityClient.fetch<{ _id: string }[]>(
        `*[_type == "product" && isFeatured == true][0...4]{_id}`
      )
      if (featured.length > 0) {
        const refs = featured.map((p, i) => ({
          _type: 'reference',
          _ref: p._id,
          _key: `featured-${i}`,
        }))
        await sanityClient.patch('homepage').set({ featuredProducts: refs }).commit()
        console.log(`  Added ${refs.length} featured products to homepage`)
      } else {
        // Use first 4 products
        const first4 = await sanityClient.fetch<{ _id: string }[]>(
          `*[_type == "product"][0...4]{_id}`
        )
        if (first4.length > 0) {
          const refs = first4.map((p, i) => ({
            _type: 'reference',
            _ref: p._id,
            _key: `featured-${i}`,
          }))
          await sanityClient.patch('homepage').set({ featuredProducts: refs }).commit()
          console.log(`  Added ${refs.length} products to homepage (no featured flag, using first 4)`)
        }
      }
    } catch (err) {
      console.error('  Failed to patch homepage featured products:', err)
    }
  }

  // Print summary
  console.log('\n=== Migration complete! ===')
  console.log('\nVerify counts:')
  try {
    const counts = await sanityClient.fetch(`{
      "products": count(*[_type == "product"]),
      "categories": count(*[_type == "category"]),
      "pages": count(*[_type == "page"]),
      "faqs": count(*[_type == "faq"]),
      "homepage": count(*[_type == "homepage"]),
      "menuItems": count(*[_type == "menuItem"])
    }`)
    console.log(JSON.stringify(counts, null, 2))
  } catch (err) {
    console.error('Could not fetch counts:', err)
  }
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
