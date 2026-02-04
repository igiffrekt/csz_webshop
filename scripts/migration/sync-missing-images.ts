/**
 * Sync ONLY missing WooCommerce Product Images to Strapi
 *
 * This script:
 * 1. Finds Strapi products WITHOUT images
 * 2. Matches them to WooCommerce products by SKU
 * 3. Downloads and uploads only the missing images
 *
 * Usage:
 *   npx tsx scripts/migration/sync-missing-images.ts
 */

import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.join(__dirname, '../../apps/web/.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
}

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const WOO_URL = process.env.WOOCOMMERCE_URL;
const WOO_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WOO_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

interface WooProduct {
  id: number;
  sku: string;
  name: string;
  images: { id: number; src: string; name: string; alt: string }[];
}

interface StrapiProduct {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  sku: string;
  images: { id: number; url: string }[] | null;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getAllWooProducts(): Promise<WooProduct[]> {
  console.log('📦 Fetching products from WooCommerce...');
  const allProducts: WooProduct[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${WOO_URL}/wp-json/wc/v3/products?per_page=${perPage}&page=${page}`;
    const response = await fetch(url, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${WOO_KEY}:${WOO_SECRET}`).toString('base64'),
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status}`);
    }

    const products: WooProduct[] = await response.json();
    if (products.length === 0) break;

    allProducts.push(...products);
    console.log(`  Page ${page}: ${products.length} products (total: ${allProducts.length})`);

    if (products.length < perPage) break;
    page++;
    await delay(100);
  }

  // Filter products with images
  const withImages = allProducts.filter(p => p.images && p.images.length > 0);
  console.log(`  ✓ Found ${withImages.length} products with images\n`);

  return withImages;
}

async function getStrapiProductsWithoutImages(): Promise<StrapiProduct[]> {
  console.log('📋 Fetching Strapi products without images...');
  const productsWithoutImages: StrapiProduct[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const response = await fetch(
      `${STRAPI_URL}/api/products?populate=images&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
      {
        headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Strapi products: ${response.status}`);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) break;

    // Only keep products without images
    for (const product of data.data) {
      if (!product.images || product.images.length === 0) {
        productsWithoutImages.push(product);
      }
    }

    if (data.data.length < pageSize) break;
    page++;
  }

  console.log(`  ✓ Found ${productsWithoutImages.length} products without images\n`);
  return productsWithoutImages;
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (e) {
    return null;
  }
}

async function uploadImageToStrapi(
  imageBuffer: Buffer,
  filename: string
): Promise<number | null> {
  try {
    const formData = new FormData();
    const blob = new Blob([imageBuffer]);
    formData.append('files', blob, filename);

    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    if (result && result.length > 0) {
      return result[0].id;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function linkImageToProduct(
  productDocumentId: string,
  fileId: number
): Promise<boolean> {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/products/${productDocumentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            images: [fileId],
          },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Sync MISSING Images from WooCommerce     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Validate config
  if (!STRAPI_TOKEN) {
    console.error('❌ STRAPI_API_TOKEN is required');
    process.exit(1);
  }
  if (!WOO_URL || !WOO_KEY || !WOO_SECRET) {
    console.error('❌ WooCommerce credentials are required');
    process.exit(1);
  }

  // Get Strapi products WITHOUT images
  const strapiProductsNoImages = await getStrapiProductsWithoutImages();

  if (strapiProductsNoImages.length === 0) {
    console.log('✅ All products already have images!');
    return;
  }

  // Get WooCommerce products with images
  const wooProducts = await getAllWooProducts();

  // Build maps for matching
  const wooSkuMap = new Map<string, WooProduct>();
  const wooNameMap = new Map<string, WooProduct>();

  for (const p of wooProducts) {
    if (p.sku) {
      wooSkuMap.set(p.sku, p);
    }
    // Also map by normalized name for fuzzy matching
    const normalizedName = p.name.toLowerCase().trim();
    wooNameMap.set(normalizedName, p);
  }

  // Process each Strapi product without images
  console.log('🖼️  Syncing missing images...\n');

  let synced = 0;
  let notFound = 0;
  let failed = 0;

  for (const strapiProduct of strapiProductsNoImages) {
    // Try to find matching WooCommerce product
    let wooProduct: WooProduct | undefined;

    // First try by SKU
    if (strapiProduct.sku) {
      wooProduct = wooSkuMap.get(strapiProduct.sku);
    }

    // If not found, try by name
    if (!wooProduct) {
      const normalizedName = strapiProduct.name.toLowerCase().trim();
      wooProduct = wooNameMap.get(normalizedName);
    }

    if (!wooProduct) {
      console.log(`  ⚠ No WooCommerce match: ${strapiProduct.name}`);
      notFound++;
      continue;
    }

    // Get first image
    const image = wooProduct.images[0];
    if (!image || !image.src) {
      console.log(`  ⚠ No image in WooCommerce: ${strapiProduct.name}`);
      notFound++;
      continue;
    }

    // Download image
    const imageBuffer = await downloadImage(image.src);
    if (!imageBuffer) {
      console.log(`  ✗ Download failed: ${strapiProduct.name}`);
      failed++;
      continue;
    }

    // Extract filename from URL
    const urlParts = image.src.split('/');
    let filename = urlParts[urlParts.length - 1].split('?')[0];
    if (!filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      filename = `${strapiProduct.sku || strapiProduct.id}.jpg`;
    }

    // Upload to Strapi
    const fileId = await uploadImageToStrapi(imageBuffer, filename);
    if (!fileId) {
      console.log(`  ✗ Upload failed: ${strapiProduct.name}`);
      failed++;
      continue;
    }

    // Link to product
    const success = await linkImageToProduct(strapiProduct.documentId, fileId);
    if (success) {
      synced++;
      console.log(`  ✓ [${synced}] ${strapiProduct.name}`);
    } else {
      console.log(`  ✗ Link failed: ${strapiProduct.name}`);
      failed++;
    }

    await delay(100); // Rate limiting
  }

  console.log('\n════════════════════════════════════════════');
  console.log(`✅ Synced: ${synced}`);
  console.log(`⚠️ Not found in WooCommerce: ${notFound}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('════════════════════════════════════════════\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
