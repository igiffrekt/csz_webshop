import qs from "qs";
import type {
  Product,
  Category,
  StrapiListResponse,
  StrapiResponse,
} from "@csz/types";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export interface ProductFilters {
  category?: string;
  search?: string;
  featured?: boolean;
  onSale?: boolean;
  fireClass?: string; // Fire class filter: 'A', 'B', or 'C'
  certification?: string[]; // Certification filter: ['CE', 'EN3']
  page?: number;
  pageSize?: number;
}

export async function getProducts(
  filters: ProductFilters = {}
): Promise<StrapiListResponse<Product>> {
  const query = qs.stringify(
    {
      filters: {
        ...(filters.category && {
          categories: { slug: { $eq: filters.category } },
        }),
        ...(filters.search && { name: { $containsi: filters.search } }),
        ...(filters.featured && { isFeatured: { $eq: true } }),
        ...(filters.onSale && { isOnSale: { $eq: true } }),
        // Fire class filter - filters products by fire class in specifications
        // Assumes products have a specification with name containing "Tűzosztály" or "Fire Class"
        ...(filters.fireClass && {
          specifications: {
            $or: [
              { name: "Tűzosztály", value: { $containsi: filters.fireClass } },
              { name: "Fire Class", value: { $containsi: filters.fireClass } },
            ],
          },
        }),
        // Certification filter - filters products by certification name
        ...(filters.certification &&
          filters.certification.length > 0 && {
            certifications: {
              name: { $in: filters.certification },
            },
          }),
      },
      populate: {
        images: {
          fields: ["url", "alternativeText", "width", "height", "formats"],
        },
        categories: { fields: ["name", "slug"] },
        certifications: true,
        specifications: true,
      },
      pagination: {
        page: filters.page || 1,
        pageSize: filters.pageSize || 12,
      },
      sort: ["createdAt:desc"],
    },
    { encodeValuesOnly: true }
  );

  const res = await fetch(`${STRAPI_URL}/api/products?${query}`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  return res.json();
}

export async function getProduct(
  slug: string
): Promise<StrapiResponse<Product> | null> {
  const query = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      populate: {
        images: {
          fields: ["url", "alternativeText", "width", "height", "formats"],
        },
        documents: { fields: ["url", "name"] },
        categories: { fields: ["name", "slug"] },
        variants: {
          populate: {
            image: { fields: ["url", "alternativeText"] },
          },
        },
        specifications: true,
        certifications: {
          populate: {
            certificate: { fields: ["url", "name"] },
          },
        },
      },
    },
    { encodeValuesOnly: true }
  );

  const res = await fetch(`${STRAPI_URL}/api/products?${query}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.status}`);
  }

  const data: StrapiListResponse<Product> = await res.json();

  // Return single product or null if not found
  if (data.data.length === 0) {
    return null;
  }

  return {
    data: data.data[0],
    meta: {},
  };
}

export async function getCategories(): Promise<StrapiListResponse<Category>> {
  const query = qs.stringify(
    {
      populate: {
        image: { fields: ["url", "alternativeText", "width", "height"] },
        parent: { fields: ["name", "slug"] },
        children: { fields: ["name", "slug"] },
      },
      pagination: {
        pageSize: 100, // Get all categories
      },
      sort: ["name:asc"],
    },
    { encodeValuesOnly: true }
  );

  const res = await fetch(`${STRAPI_URL}/api/categories?${query}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }

  return res.json();
}

export async function getFeaturedProducts(): Promise<
  StrapiListResponse<Product>
> {
  return getProducts({ featured: true, pageSize: 8 });
}
