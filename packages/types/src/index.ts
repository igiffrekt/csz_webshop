// Shared TypeScript types for CSZ Webshop
// Types compatible with Sanity CMS + Prisma ORM

// Sanity image asset
export interface SanityImageAsset {
  _key?: string
  url: string
  alt?: string | null
  width?: number
  height?: number
}

// Specification (Sanity object)
export interface Specification {
  _key?: string
  name: string
  value: string
  unit?: string
}

// Certification (Sanity object)
export interface Certification {
  _key?: string
  name: string
  standard?: string
  issuedDate?: string
  expiryDate?: string
  certificate?: string // URL to certificate file
}

// Category from Sanity
export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: SanityImageAsset | null
  parent?: {
    _id: string
    name: string
    slug: string
  } | null
  children?: Category[]
  productCount?: number
}

// Product from Sanity
export interface Product {
  _id: string
  _createdAt?: string
  name: string
  slug: string
  sku: string
  description?: any // Portable Text blocks
  shortDescription?: string
  basePrice: number
  compareAtPrice?: number
  stock: number
  weight?: number
  isFeatured: boolean
  isOnSale: boolean
  images?: SanityImageAsset[]
  documents?: { _key?: string; url: string; name: string }[]
  specifications?: Specification[]
  certifications?: Certification[]
  categories?: { _id: string; name: string; slug: string }[]
  variants?: ProductVariant[]
}

// Product Variant from Sanity
export interface ProductVariant {
  _id: string
  name: string
  slug?: string
  sku: string
  price: number
  compareAtPrice?: number
  stock: number
  weight?: number
  attributeLabel?: string
  attributeValue?: string
  image?: SanityImageAsset | null
}

// Cart item for client-side cart state
export interface CartItem {
  id: string                    // Unique cart line item ID
  productId: string             // Sanity product _id
  variantId?: string            // Sanity variant _id
  name: string
  variantName?: string
  sku: string
  price: number                 // Price in HUF
  quantity: number
  image?: string                // Image URL
  maxStock: number
}

// Applied coupon in cart
export interface AppliedCoupon {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  discountAmount: number
}

// Session user (from NextAuth)
export interface SessionUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  companyName?: string | null
  vatNumber?: string | null
  username?: string | null
}

// User profile (from Prisma)
export interface UserProfile {
  id: string
  email: string
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  companyName?: string | null
  vatNumber?: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

// Shipping address (from Prisma)
export interface ShippingAddress {
  id: string
  label: string
  recipientName: string
  street: string
  city: string
  postalCode: string
  country: string
  phone?: string | null
  isDefault: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

// Order line item
export interface OrderLineItem {
  productId: string
  variantId?: string
  name: string
  variantName?: string
  sku: string
  price: number
  quantity: number
  total: number
}

// Order status
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

// Address snapshot in orders
export interface OrderAddressSnapshot {
  recipientName: string
  street: string
  city: string
  postalCode: string
  country: string
  phone?: string
}

export interface BillingAddressSnapshot extends OrderAddressSnapshot {
  companyName?: string
  vatNumber?: string
}

// Order (from Prisma)
export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  userId: string
  subtotal: number
  discount: number
  shipping: number
  vatAmount: number
  total: number
  shippingAddress: OrderAddressSnapshot
  billingAddress?: BillingAddressSnapshot
  lineItems: OrderLineItem[]
  couponCode?: string | null
  couponDiscount?: number | null
  poReference?: string | null
  paymentMethod?: string | null
  paymentId?: string | null
  stripeSessionId?: string | null
  paidAt?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

// Coupon (from Prisma)
export interface Coupon {
  id: string
  code: string
  description?: string | null
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minimumOrderAmount: number
  maximumDiscount?: number | null
  usageLimit?: number | null
  usedCount: number
  validFrom?: string | null
  validUntil?: string | null
  isActive: boolean
}

// Menu item (from Sanity)
export interface MenuItem {
  _id: string
  cim: string
  tipus: 'url' | 'kategoria'
  url?: string
  kategoria?: {
    _id: string
    name: string
    slug: string
  } | null
  children?: MenuItem[]
  sorrend: number
  nyitasUjTabon: boolean
  ikon?: string
}

// Sanity Page
export interface Page {
  _id: string
  title: string
  slug: string
  content?: any // Portable Text
  seo?: {
    metaTitle?: string
    metaDescription?: string
    metaImage?: SanityImageAsset
    keywords?: string
  }
}

// FAQ from Sanity
export interface FAQ {
  _id: string
  question: string
  answer: any // Portable Text
  order: number
  category?: string
}

// Quote types
export * from './quote.js'
