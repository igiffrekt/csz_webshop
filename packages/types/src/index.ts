// Shared TypeScript types for CSZ Webshop
// Types matching Strapi 5 content type schemas

// Media type from Strapi
export interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  name: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
}

// Specification component (product.specification)
export interface Specification {
  id: number;
  name: string;
  value: string;
  unit?: string;
}

// Certification component (product.certification)
export interface Certification {
  id: number;
  name: string;
  standard?: string;
  issuedDate?: string;
  expiryDate?: string;
  certificate?: StrapiMedia;
}

// Category content type
export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  image?: StrapiMedia;
  parent?: Category;
  children?: Category[];
  products?: Product[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Product Variant content type
export interface ProductVariant {
  id: number;
  documentId: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  weight?: number;
  attributeLabel?: string;
  attributeValue?: string;
  image?: StrapiMedia;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Coupon content type
export interface Coupon {
  id: number;
  documentId: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Product content type
export interface Product {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  basePrice: number;
  compareAtPrice?: number;
  stock: number;
  weight?: number;
  isFeatured: boolean;
  isOnSale: boolean;
  images?: StrapiMedia[];
  documents?: StrapiMedia[];
  specifications?: Specification[];
  certifications?: Certification[];
  categories?: Category[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Strapi response wrappers
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Cart item for client-side cart state
export interface CartItem {
  id: string;                    // Unique cart line item ID (productDocId-variantDocId or just productDocId)
  productId: number;             // Strapi product ID
  productDocumentId: string;     // Strapi documentId for API calls
  variantId?: number;            // Optional variant ID
  variantDocumentId?: string;    // Variant documentId
  name: string;                  // Product name for display
  variantName?: string;          // Variant name (e.g., "6kg")
  sku: string;                   // SKU for the specific item
  price: number;                 // Price at time of adding (in HUF)
  quantity: number;              // Quantity in cart
  image?: string;                // Product image URL (full URL)
  maxStock: number;              // Max available for quantity validation
}

// Applied coupon in cart
export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;        // Calculated discount in HUF
}

// User profile from Strapi users-permissions
export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  vatNumber?: string;
  shippingAddresses?: ShippingAddress[];
  createdAt: string;
  updatedAt: string;
}

// Shipping address for user account
export interface ShippingAddress {
  id: number;
  documentId: string;
  label: string;
  recipientName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// Auth response from Strapi login/register
export interface AuthResponse {
  jwt: string;
  user: User;
}

// Session payload for encrypted cookie
export interface SessionPayload {
  jwt: string;
  userId: number;
  userDocumentId: string;
  email: string;
  username: string;
  expiresAt: Date;
}

// Order line item (product in an order)
export interface OrderLineItem {
  id: number;
  productId: number;
  productDocumentId: string;
  variantId?: number;
  variantDocumentId?: string;
  name: string;
  variantName?: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

// Order status enum
export type OrderStatus =
  | "pending"           // Awaiting payment
  | "paid"              // Payment confirmed
  | "processing"        // Being prepared
  | "shipped"           // Shipped to customer
  | "delivered"         // Delivered
  | "cancelled"         // Cancelled
  | "refunded";         // Refunded

// Order content type (placeholder - full implementation in Phase 6)
export interface Order {
  id: number;
  documentId: string;
  orderNumber: string;
  status: OrderStatus;
  user?: User;
  // Pricing
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  // Address snapshot (copied at order time)
  shippingAddress: {
    recipientName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    recipientName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    companyName?: string;
    vatNumber?: string;
  };
  // Line items
  lineItems: OrderLineItem[];
  // Coupon info if applied
  couponCode?: string;
  couponDiscount?: number;
  // Payment info
  paymentMethod?: string;
  paymentId?: string;
  paidAt?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
