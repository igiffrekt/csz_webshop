/**
 * Sync WooCommerce Product Images to Strapi
 *
 * This script:
 * 1. Deletes all existing files from Strapi
 * 2. Fetches products from WooCommerce with their images
 * 3. Downloads and uploads images to Strapi
 * 4. Links images to matching Strapi products by SKU
 *
 * Usage:
 *   npx tsx scripts/migration/sync-woo-images.ts
 *
 * Required environment variables:
 *   STRAPI_URL, STRAPI_ADMIN_TOKEN
 *   WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET
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
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;
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
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function deleteAllStrapiFiles(): Promise<void> {
  console.log('🗑️  Deleting all existing files from Strapi...');

  const response = await fetch(`${STRAPI_URL}/api/upload/files`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch files: ${response.status}`);
  }

  const files = await response.json();
  console.log(`  Found ${files.length} files to delete`);

  let deleted = 0;
  for (const file of files) {
    try {
      const delResponse = await fetch(`${STRAPI_URL}/api/upload/files/${file.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      });

      if (delResponse.ok) {
        deleted++;
        if (deleted % 20 === 0) {
          console.log(`  Deleted ${deleted}/${files.length}...`);
        }
      }
      await delay(20);
    } catch (e) {
      // Ignore individual errors
    }
  }

  console.log(`  ✓ Deleted ${deleted} files\n`);
}

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

async function getAllStrapiProducts(): Promise<StrapiProduct[]> {
  console.log('📋 Fetching products from Strapi...');
  const allProducts: StrapiProduct[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const response = await fetch(
      `${STRAPI_URL}/api/products?pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
      {
        headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Strapi products: ${response.status}`);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) break;

    allProducts.push(...data.data);

    if (data.data.length < pageSize) break;
    page++;
  }

  console.log(`  ✓ Found ${allProducts.length} products\n`);
  return allProducts;
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
  console.log('║   Sync WooCommerce Images to Strapi        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Validate config
  if (!STRAPI_TOKEN) {
    console.error('❌ STRAPI_ADMIN_TOKEN is required');
    process.exit(1);
  }
  if (!WOO_URL || !WOO_KEY || !WOO_SECRET) {
    console.error('❌ WooCommerce credentials are required');
    process.exit(1);
  }

  // Step 1: Delete existing files
  await deleteAllStrapiFiles();

  // Step 2: Get all data
  const wooProducts = await getAllWooProducts();
  const strapiProducts = await getAllStrapiProducts();

  // Build SKU map for Strapi products
  const strapiSkuMap = new Map<string, StrapiProduct>();
  for (const p of strapiProducts) {
    if (p.sku) {
      strapiSkuMap.set(p.sku, p);
    }
  }

  // Step 3: Process each WooCommerce product
  console.log('🖼️  Downloading and uploading images...\n');

  let processed = 0;
  let linked = 0;
  let failed = 0;

  for (const wooProduct of wooProducts) {
    // Find matching Strapi product by SKU
    const strapiProduct = strapiSkuMap.get(wooProduct.sku);

    if (!strapiProduct) {
      // Try to find by WOO-ID pattern
      const wooSku = `WOO-${wooProduct.id}`;
      const altProduct = strapiSkuMap.get(wooSku);
      if (!altProduct) {
        continue; // No matching Strapi product
      }
    }

    const matchedProduct = strapiProduct || strapiSkuMap.get(`WOO-${wooProduct.id}`);
    if (!matchedProduct) continue;

    // Get first image
    const image = wooProduct.images[0];
    if (!image || !image.src) continue;

    // Download image
    const imageBuffer = await downloadImage(image.src);
    if (!imageBuffer) {
      failed++;
      continue;
    }

    // Extract filename from URL
    const urlParts = image.src.split('/');
    let filename = urlParts[urlParts.length - 1].split('?')[0];
    if (!filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      filename = `${wooProduct.sku || wooProduct.id}.jpg`;
    }

    // Upload to Strapi
    const fileId = await uploadImageToStrapi(imageBuffer, filename);
    if (!fileId) {
      failed++;
      continue;
    }

    // Link to product
    const success = await linkImageToProduct(matchedProduct.documentId, fileId);
    if (success) {
      linked++;
      console.log(`  ✓ ${matchedProduct.name}`);
    } else {
      failed++;
    }

    processed++;
    await delay(100); // Rate limiting

    if (processed % 20 === 0) {
      console.log(`\n  Progress: ${processed}/${wooProducts.length} (${linked} linked, ${failed} failed)\n`);
    }
  }

  console.log('\n════════════════════════════════════════════');
  console.log(`✅ Processed: ${processed}`);
  console.log(`✅ Linked: ${linked}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('════════════════════════════════════════════\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
