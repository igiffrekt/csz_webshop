import { defineQuery } from 'next-sanity'
import { client } from './sanity'

// ============ Product Queries ============

const PRODUCTS_QUERY = defineQuery(`
  *[_type == "product"
    && ($category == "" || $category in categories[]->slug.current || $category in categories[]->parent->slug.current)
    && ($search == "" || name match $search + "*" || sku match $search + "*")
    && ($featured == false || isFeatured == true)
    && ($onSale == false || isOnSale == true)
  ] | order(_createdAt desc) [$start...$end] {
    _id,
    _createdAt,
    name,
    "slug": slug.current,
    sku,
    basePrice,
    compareAtPrice,
    stock,
    weight,
    isFeatured,
    isOnSale,
    shortDescription,
    "images": images[]{
      _key,
      "url": asset->url,
      "alt": asset->altText,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    },
    "categories": categories[]->{
      _id,
      name,
      "slug": slug.current
    },
    specifications[]{
      _key,
      name,
      value,
      unit
    },
    certifications[]{
      _key,
      name,
      standard
    }
  }
`)

const PRODUCTS_COUNT_QUERY = defineQuery(`
  count(*[_type == "product"
    && ($category == "" || $category in categories[]->slug.current || $category in categories[]->parent->slug.current)
    && ($search == "" || name match $search + "*" || sku match $search + "*")
    && ($featured == false || isFeatured == true)
    && ($onSale == false || isOnSale == true)
  ])
`)

const PRODUCT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    "slug": slug.current,
    sku,
    description,
    shortDescription,
    basePrice,
    compareAtPrice,
    stock,
    weight,
    isFeatured,
    isOnSale,
    "images": images[]{
      _key,
      "url": asset->url,
      "alt": asset->altText,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    },
    "documents": documents[]{
      _key,
      "url": asset->url,
      "name": asset->originalFilename
    },
    "categories": categories[]->{
      _id,
      name,
      "slug": slug.current
    },
    "variants": variants[]->{
      _id,
      name,
      sku,
      price,
      compareAtPrice,
      stock,
      weight,
      attributeLabel,
      attributeValue,
      "image": image{
        "url": asset->url,
        "alt": asset->altText
      }
    },
    specifications[]{
      _key,
      name,
      value,
      unit
    },
    certifications[]{
      _key,
      name,
      standard,
      issuedDate,
      expiryDate,
      "certificate": certificate.asset->url
    }
  }
`)

// Query to get product prices for server-side calculation
const PRODUCT_PRICES_QUERY = defineQuery(`
  *[_type == "product" && _id in $ids] {
    _id,
    basePrice,
    "variants": variants[]->{
      _id,
      price
    }
  }
`)

// ============ Category Queries ============

const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    productCount,
    "image": image{
      "url": asset->url,
      "alt": asset->altText
    },
    "parent": parent->{
      _id,
      name,
      "slug": slug.current
    }
  }
`)

const CATEGORY_TREE_QUERY = defineQuery(`
  *[_type == "category" && !defined(parent)] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    productCount,
    "image": image{
      "url": asset->url,
      "alt": asset->altText
    },
    "children": *[_type == "category" && parent._ref == ^._id] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      productCount,
      "image": image{
        "url": asset->url,
        "alt": asset->altText
      },
      "children": *[_type == "category" && parent._ref == ^._id] | order(name asc) {
        _id,
        name,
        "slug": slug.current,
        description,
        productCount,
        "image": image{
          "url": asset->url,
          "alt": asset->altText
        }
      }
    }
  }
`)

const CATEGORY_BY_SLUG_QUERY = defineQuery(`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    productCount,
    "image": image{
      "url": asset->url,
      "alt": asset->altText
    },
    "parent": parent->{
      _id,
      name,
      "slug": slug.current
    },
    "children": *[_type == "category" && parent._ref == ^._id] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      productCount,
      "image": image{
        "url": asset->url,
        "alt": asset->altText
      }
    }
  }
`)

// ============ Homepage Query ============

const HOMEPAGE_QUERY = defineQuery(`
  *[_type == "homepage"][0] {
    heroSection,
    videoSection,
    categoriesSection,
    "featuredProducts": featuredProducts[]->{
      _id,
      name,
      "slug": slug.current,
      basePrice,
      compareAtPrice,
      stock,
      isFeatured,
      isOnSale,
      "images": images[0]{
        "url": asset->url,
        "alt": asset->altText
      }
    },
    dealsSection{
      title,
      subtitle,
      "products": products[]->{
        _id,
        name,
        "slug": slug.current,
        basePrice,
        compareAtPrice,
        stock,
        isOnSale,
        "images": images[0]{
          "url": asset->url,
          "alt": asset->altText
        }
      }
    },
    promoBanners[]{
      _key,
      title,
      description,
      "image": image{
        "url": asset->url,
        "alt": asset->altText
      },
      link,
      backgroundColor
    },
    faqSection,
    trustBadges[]{
      _key,
      title,
      description,
      icon
    },
    seo
  }
`)

// ============ Menu Query ============

const MENU_ITEMS_QUERY = defineQuery(`
  *[_type == "menuItem" && !defined(parent)] | order(sorrend asc) {
    _id,
    cim,
    tipus,
    url,
    "kategoria": kategoria->{
      _id,
      name,
      "slug": slug.current
    },
    sorrend,
    nyitasUjTabon,
    ikon,
    "children": *[_type == "menuItem" && parent._ref == ^._id] | order(sorrend asc) {
      _id,
      cim,
      tipus,
      url,
      "kategoria": kategoria->{
        _id,
        name,
        "slug": slug.current
      },
      sorrend,
      nyitasUjTabon,
      ikon
    }
  }
`)

// ============ Page Query ============

const PAGE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    content,
    seo
  }
`)

// ============ FAQ Query ============

const FAQS_QUERY = defineQuery(`
  *[_type == "faq"] | order(order asc) {
    _id,
    question,
    answer,
    order,
    category
  }
`)

// ============ Blog Queries ============

const BLOG_POSTS_QUERY = defineQuery(`
  *[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc) [$start...$end] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "coverImage": coverImage{
      "url": asset->url,
      "alt": asset->altText,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    },
    publishedAt,
    author
  }
`)

const BLOG_POSTS_COUNT_QUERY = defineQuery(`
  count(*[_type == "blogPost" && defined(publishedAt)])
`)

const BLOG_POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "coverImage": coverImage{
      "url": asset->url,
      "alt": asset->altText,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    },
    body,
    publishedAt,
    author,
    seo
  }
`)

// ============ Footer Query ============

const FOOTER_QUERY = defineQuery(`
  *[_type == "footer"][0] {
    companyDescription,
    socialLinks[]{
      _key,
      platform,
      url
    },
    linkColumns[]{
      _key,
      title,
      links[]{
        _key,
        label,
        href
      }
    },
    bottomBarLinks[]{
      _key,
      label,
      href
    },
    copyrightText
  }
`)

// ============ Instant Search Query ============

const INSTANT_SEARCH_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product"
    && (
      name match $search + "*"
      || sku match $search + "*"
      || $search in categories[]->name
      || count(string::split(lower(name), lower($search))) > 1
      || count(string::split(lower(sku), lower($search))) > 1
    )
  ] | order(_createdAt desc) [0...20] {
    _id,
    name,
    "slug": slug.current,
    sku,
    basePrice,
    compareAtPrice,
    isOnSale,
    "image": images[0]{
      "url": asset->url,
      "alt": asset->altText
    },
    "categories": categories[]->{
      _id,
      name,
      "slug": slug.current
    }
  }
`)

const INSTANT_SEARCH_CATEGORIES_QUERY = defineQuery(`
  *[_type == "category" && (name match $search + "*" || count(string::split(lower(name), lower($search))) > 1)] | order(name asc) [0...8] {
    _id,
    name,
    "slug": slug.current,
    "image": image{
      "url": asset->url,
      "alt": asset->altText
    },
    "productCount": count(*[_type == "product" && references(^._id)])
  }
`)

// ============ Fetcher Functions ============

export interface ProductFilters {
  category?: string
  search?: string
  featured?: boolean
  onSale?: boolean
  page?: number
  pageSize?: number
}

export async function getProducts(filters: ProductFilters = {}) {
  const page = filters.page || 1
  const pageSize = filters.pageSize || 12
  const start = (page - 1) * pageSize
  const end = start + pageSize

  const params = {
    category: filters.category || '',
    search: filters.search || '',
    featured: filters.featured || false,
    onSale: filters.onSale || false,
    start,
    end,
  }

  const [products, total] = await Promise.all([
    client.fetch(PRODUCTS_QUERY, params, { next: { revalidate: 60 } }),
    client.fetch(PRODUCTS_COUNT_QUERY, params, { next: { revalidate: 60 } }),
  ])

  return {
    data: products || [],
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil((total || 0) / pageSize),
        total: total || 0,
      },
    },
  }
}

export async function getProduct(slug: string) {
  return client.fetch(
    PRODUCT_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 60 } }
  )
}

export async function getProductPrices(ids: string[]) {
  return client.fetch(
    PRODUCT_PRICES_QUERY,
    { ids },
    { next: { revalidate: 0 } }
  )
}

export async function getCategories() {
  const categories = await client.fetch(
    CATEGORIES_QUERY,
    {},
    { next: { revalidate: 60 } }
  )
  return { data: categories || [] }
}

export async function getCategoryTree() {
  return client.fetch(
    CATEGORY_TREE_QUERY,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getCategory(slug: string) {
  return client.fetch(
    CATEGORY_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 60 } }
  )
}

export async function getHomepage() {
  return client.fetch(
    HOMEPAGE_QUERY,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getFooter() {
  return client.fetch(
    FOOTER_QUERY,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getMenuItems() {
  return client.fetch(
    MENU_ITEMS_QUERY,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getPageBySlug(slug: string) {
  return client.fetch(
    PAGE_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 60 } }
  )
}

export async function getFAQs() {
  return client.fetch(
    FAQS_QUERY,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function instantSearch(search: string) {
  const params = { search }

  const [products, categories] = await Promise.all([
    client.fetch(INSTANT_SEARCH_PRODUCTS_QUERY, params, { next: { revalidate: 0 } }),
    client.fetch(INSTANT_SEARCH_CATEGORIES_QUERY, params, { next: { revalidate: 0 } }),
  ])

  return {
    products: products || [],
    categories: categories || [],
  }
}

export async function getBlogPosts(page = 1, pageSize = 9) {
  const start = (page - 1) * pageSize
  const end = start + pageSize

  const [posts, total] = await Promise.all([
    client.fetch(BLOG_POSTS_QUERY, { start, end }, { next: { revalidate: 60 } }),
    client.fetch(BLOG_POSTS_COUNT_QUERY, {}, { next: { revalidate: 60 } }),
  ])

  return {
    data: posts || [],
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil((total || 0) / pageSize),
        total: total || 0,
      },
    },
  }
}

export async function getBlogPost(slug: string) {
  return client.fetch(
    BLOG_POST_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 60 } }
  )
}

// Re-export for convenience
export { PRODUCT_PRICES_QUERY }
