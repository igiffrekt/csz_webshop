// Strapi CMS API client
import type { Product, Category, StrapiMedia, Specification, Certification } from '@csz/types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// Re-export types for convenience
export type { Product, Category, StrapiMedia } from '@csz/types';

// Type for categories used by display components (simplified from API response)
export interface DisplayCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: {
    url: string;
    alternativeText: string | null;
  } | null;
  parent?: {
    id: number;
    documentId: string;
    name: string;
    slug: string;
  } | null;
  children?: DisplayCategory[];
  count?: number;
}

interface StrapiImage {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  name: string;
  width: number;
  height: number;
}

interface StrapiCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  image: StrapiImage | null;
  parent: { id: number; documentId: string; name: string; slug: string } | null;
  children: {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: StrapiImage | null;
  }[];
  products?: { id: number }[]; // Strapi returns array of products
}

interface StrapiSpecification {
  id: number;
  name: string;
  value: string;
}

interface StrapiCertification {
  id: number;
  name: string;
  issuedBy: string | null;
  validUntil: string | null;
  certificate: { url: string; name: string } | null;
}

interface StrapiDocument {
  id: number;
  url: string;
  name: string;
}

interface StrapiProduct {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  shortDescription: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  stock: number;
  weight: number | null;
  isFeatured: boolean;
  isOnSale: boolean;
  images: StrapiImage[];
  categories: { id: number; documentId: string; name: string; slug: string }[];
  specifications?: StrapiSpecification[];
  certifications?: StrapiCertification[];
  documents?: StrapiDocument[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface StrapiResponse<T> {
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

async function strapiFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<StrapiResponse<T>> {
  const url = new URL(`${STRAPI_URL}/api${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  const response = await fetch(url.toString(), {
    headers,
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status}`);
  }

  return response.json();
}

// Get all categories with children and product counts
export async function getStrapiCategories(): Promise<StrapiCategory[]> {
  const response = await strapiFetch<StrapiCategory[]>('/categories', {
    'populate[image]': 'true',
    'populate[children][populate][products][fields][0]': 'id',
    'populate[children][populate][image]': 'true',
    'populate[parent]': 'true',
    'populate[products][fields][0]': 'id',
    'pagination[pageSize]': '100',
  });

  return response.data;
}

// Get category tree (parent categories with children)
export interface CategoryWithChildren extends Omit<StrapiCategory, 'children'> {
  children: (StrapiCategory & { count: number })[];
  count: number;
}

export async function getStrapiCategoryTree(): Promise<CategoryWithChildren[]> {
  const allCategories = await getStrapiCategories();

  // Separate parent categories (no parent) from children
  const parentCategories = allCategories.filter(cat => !cat.parent);
  const childCategories = allCategories.filter(cat => cat.parent);

  // Build tree structure
  return parentCategories.map(parent => {
    const children = childCategories
      .filter(child => child.parent?.id === parent.id)
      .map(child => ({
        ...child,
        count: child.products?.length || 0,
      }));

    // Count products in parent + all children
    const productCount = (parent.products?.length || 0) +
      children.reduce((sum, child) => sum + child.count, 0);

    return {
      ...parent,
      children,
      count: productCount,
    };
  });
}

// Get products with pagination
export async function getStrapiProducts(params: {
  page?: number;
  pageSize?: number;
  category?: string;
  featured?: boolean;
  search?: string;
  sort?: string;
} = {}): Promise<{ products: StrapiProduct[]; total: number; totalPages: number }> {
  const queryParams: Record<string, string> = {
    'populate[images]': 'true',
    'populate[categories]': 'true',
    'pagination[page]': String(params.page || 1),
    'pagination[pageSize]': String(params.pageSize || 12),
  };

  if (params.category) {
    queryParams['filters[categories][slug][$eq]'] = params.category;
  }

  if (params.featured) {
    queryParams['filters[isFeatured][$eq]'] = 'true';
  }

  if (params.search) {
    queryParams['filters[name][$containsi]'] = params.search;
  }

  if (params.sort) {
    queryParams['sort'] = params.sort;
  }

  const response = await strapiFetch<StrapiProduct[]>('/products', queryParams);

  return {
    products: response.data,
    total: response.meta.pagination?.total || 0,
    totalPages: response.meta.pagination?.pageCount || 1,
  };
}

// Get single product by slug
export async function getStrapiProduct(slug: string): Promise<StrapiProduct | null> {
  const response = await strapiFetch<StrapiProduct[]>('/products', {
    'filters[slug][$eq]': slug,
    'populate[images]': 'true',
    'populate[categories]': 'true',
    'populate[specifications]': 'true',
    'populate[certifications][populate][certificate]': 'true',
    'populate[documents]': 'true',
  });

  return response.data[0] || null;
}

// Get single category by slug
export async function getStrapiCategory(slug: string): Promise<StrapiCategory | null> {
  const response = await strapiFetch<StrapiCategory[]>('/categories', {
    'filters[slug][$eq]': slug,
    'populate[image]': 'true',
    'populate[children][populate][image]': 'true',
    'populate[parent]': 'true',
  });

  return response.data[0] || null;
}

// Transform Strapi product to match existing component interfaces
export function transformStrapiProduct(product: StrapiProduct): Product {
  return {
    id: product.id,
    documentId: product.documentId,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    basePrice: product.basePrice, // Stored as whole HUF: 4940 = 4 940 Ft
    compareAtPrice: product.compareAtPrice || undefined,
    description: product.description || product.shortDescription || '',
    shortDescription: product.shortDescription || undefined,
    stock: product.stock,
    weight: product.weight || undefined,
    isFeatured: product.isFeatured,
    isOnSale: product.isOnSale,
    images: (product.images || []).map((img) => ({
      id: img.id,
      documentId: img.documentId,
      url: img.url.startsWith('http') ? img.url : `${STRAPI_URL}${img.url}`,
      alternativeText: img.alternativeText,
      name: img.name,
      width: img.width,
      height: img.height,
    })),
    categories: (product.categories || []).map((cat) => ({
      id: cat.id,
      documentId: cat.documentId,
      name: cat.name,
      slug: cat.slug,
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
    })),
    specifications: (product.specifications || []).map((spec) => ({
      id: spec.id,
      name: spec.name,
      value: spec.value,
    })),
    certifications: (product.certifications || []).map((cert) => ({
      id: cert.id,
      name: cert.name,
      standard: cert.issuedBy || undefined,
      expiryDate: cert.validUntil || undefined,
      certificate: cert.certificate
        ? {
            id: 0,
            documentId: '',
            url: cert.certificate.url.startsWith('http')
              ? cert.certificate.url
              : `${STRAPI_URL}${cert.certificate.url}`,
            alternativeText: null,
            name: cert.certificate.name,
          }
        : undefined,
    })),
    documents: (product.documents || []).map((doc) => ({
      id: doc.id,
      documentId: '',
      url: doc.url.startsWith('http') ? doc.url : `${STRAPI_URL}${doc.url}`,
      alternativeText: null,
      name: doc.name,
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    publishedAt: product.publishedAt,
  };
}

// Transform Strapi category to match existing component interfaces
export function transformStrapiCategory(category: CategoryWithChildren) {
  const STRAPI_BASE = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337';

  return {
    documentId: category.documentId,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image
      ? {
          url: category.image.url.startsWith('http')
            ? category.image.url
            : `${STRAPI_BASE}${category.image.url}`,
        }
      : null,
    count: category.count,
    children: (category.children || []).map((child) => ({
      documentId: child.documentId,
      name: child.name,
      slug: child.slug,
      count: child.count || 0,
    })),
  };
}
