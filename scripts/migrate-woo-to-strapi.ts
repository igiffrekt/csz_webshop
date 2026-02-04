/**
 * Migration script: WooCommerce -> Strapi
 *
 * This script fetches all products and categories from WooCommerce
 * and imports them into the Strapi CMS.
 *
 * Usage: npx tsx scripts/migrate-woo-to-strapi.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from apps/web/.env.local
config({ path: resolve(__dirname, '../apps/web/.env.local') });
// Also load from root .env if exists
config({ path: resolve(__dirname, '../.env') });

const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

interface WooCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
  image: { src: string; alt: string } | null;
}

interface WooProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  stock_status: string;
  stock_quantity: number | null;
  weight: string;
  images: { src: string; alt: string }[];
  categories: { id: number; name: string; slug: string }[];
}

// WooCommerce API helpers
async function wooFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${WOOCOMMERCE_URL}/wp-json/wc/v3${endpoint}`);
  url.searchParams.set('consumer_key', CONSUMER_KEY!);
  url.searchParams.set('consumer_secret', CONSUMER_SECRET!);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`WooCommerce API error: ${response.status}`);
  }
  return response.json();
}

async function fetchAllWooCategories(): Promise<WooCategory[]> {
  const allCategories: WooCategory[] = [];
  let page = 1;

  while (true) {
    const categories = await wooFetch<WooCategory[]>('/products/categories', {
      per_page: '100',
      page: String(page),
    });

    if (categories.length === 0) break;
    allCategories.push(...categories);
    page++;

    console.log(`Fetched ${allCategories.length} categories...`);
  }

  return allCategories;
}

async function fetchAllWooProducts(): Promise<WooProduct[]> {
  const allProducts: WooProduct[] = [];
  let page = 1;

  while (true) {
    const products = await wooFetch<WooProduct[]>('/products', {
      per_page: '100',
      page: String(page),
    });

    if (products.length === 0) break;
    allProducts.push(...products);
    page++;

    console.log(`Fetched ${allProducts.length} products...`);
  }

  return allProducts;
}

// Strapi API helpers
async function strapiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET',
  body?: object
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  const response = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strapi API error: ${response.status} - ${error}`);
  }

  return response.json();
}

async function uploadImageToStrapi(imageUrl: string, altText: string): Promise<number | null> {
  try {
    // Fetch the image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) return null;

    const imageBuffer = await imageResponse.arrayBuffer();
    const blob = new Blob([imageBuffer]);

    // Extract filename from URL
    const filename = imageUrl.split('/').pop()?.split('?')[0] || 'image.jpg';

    const formData = new FormData();
    formData.append('files', blob, filename);

    const headers: Record<string, string> = {};
    if (STRAPI_API_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
    }

    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      console.error(`Failed to upload image: ${imageUrl}`);
      return null;
    }

    const uploaded = await response.json();
    return uploaded[0]?.id || null;
  } catch (error) {
    console.error(`Error uploading image ${imageUrl}:`, error);
    return null;
  }
}

// Migration functions
async function migrateCategories(wooCategories: WooCategory[]): Promise<Map<number, number>> {
  const wooToStrapiIdMap = new Map<number, number>();

  console.log('\n📁 Migrating categories...');

  // First pass: create all categories without parent relationships
  for (const wooCat of wooCategories) {
    try {
      // Check if category already exists by slug
      const existing = await strapiRequest(`/categories?filters[slug][$eq]=${wooCat.slug}`);

      if (existing.data && existing.data.length > 0) {
        wooToStrapiIdMap.set(wooCat.id, existing.data[0].id);
        console.log(`  ⏭️  Category "${wooCat.name}" already exists`);
        continue;
      }

      // Upload category image if exists
      let imageId: number | null = null;
      if (wooCat.image?.src) {
        imageId = await uploadImageToStrapi(wooCat.image.src, wooCat.image.alt || wooCat.name);
      }

      // Create category in Strapi
      const created = await strapiRequest('/categories', 'POST', {
        data: {
          name: wooCat.name,
          slug: wooCat.slug,
          description: wooCat.description || null,
          image: imageId,
          publishedAt: new Date().toISOString(),
        },
      });

      wooToStrapiIdMap.set(wooCat.id, created.data.id);
      console.log(`  ✅ Created category: ${wooCat.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to create category "${wooCat.name}":`, error);
    }
  }

  // Second pass: set parent relationships
  console.log('\n🔗 Setting category parent relationships...');
  for (const wooCat of wooCategories) {
    if (wooCat.parent === 0) continue;

    const strapiId = wooToStrapiIdMap.get(wooCat.id);
    const parentStrapiId = wooToStrapiIdMap.get(wooCat.parent);

    if (strapiId && parentStrapiId) {
      try {
        await strapiRequest(`/categories/${strapiId}`, 'PUT', {
          data: {
            parent: parentStrapiId,
          },
        });
        console.log(`  ✅ Set parent for "${wooCat.name}"`);
      } catch (error) {
        console.error(`  ❌ Failed to set parent for "${wooCat.name}":`, error);
      }
    }
  }

  return wooToStrapiIdMap;
}

// Helper to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function migrateProducts(
  wooProducts: WooProduct[],
  categoryMap: Map<number, number>
): Promise<void> {
  console.log('\n📦 Migrating products (skipping images for speed)...');

  for (const wooProd of wooProducts) {
    try {
      // Check if product already exists by SKU or slug
      const existingBySku = wooProd.sku
        ? await strapiRequest(`/products?filters[sku][$eq]=${encodeURIComponent(wooProd.sku)}`)
        : { data: [] };
      const existingBySlug = await strapiRequest(`/products?filters[slug][$eq]=${wooProd.slug}`);

      if ((existingBySku.data && existingBySku.data.length > 0) ||
          (existingBySlug.data && existingBySlug.data.length > 0)) {
        console.log(`  ⏭️  Product "${wooProd.name}" already exists`);
        continue;
      }

      // Skip image uploads for now to speed up migration
      const imageIds: number[] = [];

      // Map WooCommerce category IDs to Strapi IDs
      const strapiCategoryIds = wooProd.categories
        .map(cat => categoryMap.get(cat.id))
        .filter((id): id is number => id !== undefined);

      // Parse prices (WooCommerce stores as strings)
      const basePrice = Math.round(parseFloat(wooProd.price || '0') * 100) || 0; // Convert to cents
      const regularPrice = Math.round(parseFloat(wooProd.regular_price || '0') * 100) || 0;
      const salePrice = Math.round(parseFloat(wooProd.sale_price || '0') * 100) || 0;

      // compareAtPrice is the original price when on sale
      const compareAtPrice = salePrice > 0 && regularPrice > salePrice ? regularPrice : null;

      // Create product in Strapi
      const productData: Record<string, any> = {
        name: wooProd.name,
        slug: wooProd.slug,
        sku: wooProd.sku || `WOO-${wooProd.id}`,
        description: wooProd.description || null,
        shortDescription: wooProd.short_description?.substring(0, 500) || null,
        basePrice: basePrice,
        compareAtPrice: compareAtPrice,
        stock: wooProd.stock_quantity ?? (wooProd.stock_status === 'instock' ? 999 : 0),
        weight: wooProd.weight ? parseFloat(wooProd.weight) : null,
        isFeatured: false,
        isOnSale: salePrice > 0 && salePrice < regularPrice,
        images: imageIds,
        categories: strapiCategoryIds,
        publishedAt: new Date().toISOString(),
      };

      await strapiRequest('/products', 'POST', { data: productData });
      console.log(`  ✅ Created product: ${wooProd.name}`);

      // Add small delay to prevent overwhelming Strapi
      await delay(100);
    } catch (error) {
      console.error(`  ❌ Failed to create product "${wooProd.name}":`, error);
      // Wait longer on errors to let Strapi recover
      await delay(500);
    }
  }
}

async function main() {
  console.log('🚀 Starting WooCommerce to Strapi migration...\n');

  // Validate environment
  if (!WOOCOMMERCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    console.error('❌ Missing WooCommerce credentials in environment');
    process.exit(1);
  }

  console.log(`WooCommerce: ${WOOCOMMERCE_URL}`);
  console.log(`Strapi: ${STRAPI_URL}`);
  console.log('');

  try {
    // Fetch all data from WooCommerce
    console.log('📥 Fetching data from WooCommerce...');
    const wooCategories = await fetchAllWooCategories();
    const wooProducts = await fetchAllWooProducts();

    console.log(`\nFound ${wooCategories.length} categories and ${wooProducts.length} products\n`);

    // Migrate categories first (products depend on them)
    const categoryMap = await migrateCategories(wooCategories);

    // Migrate products
    await migrateProducts(wooProducts, categoryMap);

    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
