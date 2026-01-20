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
