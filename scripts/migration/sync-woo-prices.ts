/**
 * Sync WooCommerce Product Prices to Strapi
 *
 * WooCommerce price format: "8 814,00 Ft" = 8814 HUF
 * - Space is thousands separator
 * - Comma is decimal separator
 *
 * Usage:
 *   npx tsx scripts/migration/sync-woo-prices.ts
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
  price: string;           // Current price (sale price if on sale, otherwise regular)
  regular_price: string;   // Regular price
  sale_price: string;      // Sale price (empty if not on sale)
  on_sale: boolean;
}

interface StrapiProduct {
  id: number;
  documentId: string;
  name: string;
  sku: string;
  basePrice: number;
  compareAtPrice: number | null;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Parse WooCommerce price string to integer HUF
 * "8 814,00" -> 8814
 * "12 500,50" -> 12501 (rounded)
 */
function parseWooPrice(priceStr: string): number {
  if (!priceStr || priceStr.trim() === '') return 0;

  // Remove currency suffix (Ft, HUF, etc.)
  let cleaned = priceStr.replace(/[^\d\s,.-]/g, '').trim();

  // Remove spaces (thousands separator)
  cleaned = cleaned.replace(/\s/g, '');

  // Replace comma with dot for decimal
  cleaned = cleaned.replace(',', '.');

  // Parse and round to integer
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : Math.round(value);
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

  console.log(`  ✓ Found ${allProducts.length} products\n`);
  return allProducts;
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

async function updateStrapiProductPrice(
  documentId: string,
  basePrice: number,
  compareAtPrice: number | null,
  isOnSale: boolean
): Promise<boolean> {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/products/${documentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            basePrice,
            compareAtPrice,
            isOnSale,
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
  console.log('║   Sync WooCommerce Prices to Strapi        ║');
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

  // Get all data
  const wooProducts = await getAllWooProducts();
  const strapiProducts = await getAllStrapiProducts();

  // Build SKU map for Strapi products
  const strapiSkuMap = new Map<string, StrapiProduct>();
  for (const p of strapiProducts) {
    if (p.sku) {
      strapiSkuMap.set(p.sku, p);
    }
  }

  console.log('💰 Updating prices...\n');

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const wooProduct of wooProducts) {
    // Find matching Strapi product by SKU
    let strapiProduct = strapiSkuMap.get(wooProduct.sku);

    // Try WOO-ID pattern if not found
    if (!strapiProduct) {
      strapiProduct = strapiSkuMap.get(`WOO-${wooProduct.id}`);
    }

    if (!strapiProduct) {
      notFound++;
      continue;
    }

    // Parse prices
    const regularPrice = parseWooPrice(wooProduct.regular_price);
    const salePrice = parseWooPrice(wooProduct.sale_price);

    // Determine base price and compare-at price
    let basePrice: number;
    let compareAtPrice: number | null = null;
    let isOnSale = false;

    if (wooProduct.on_sale && salePrice > 0) {
      // On sale: base = sale price, compareAt = regular price
      basePrice = salePrice;
      compareAtPrice = regularPrice > salePrice ? regularPrice : null;
      isOnSale = true;
    } else {
      // Not on sale: base = regular price
      basePrice = regularPrice;
    }

    // Skip if price is 0
    if (basePrice === 0) {
      skipped++;
      continue;
    }

    // Update Strapi
    const success = await updateStrapiProductPrice(
      strapiProduct.documentId,
      basePrice,
      compareAtPrice,
      isOnSale
    );

    if (success) {
      const priceInfo = compareAtPrice
        ? `${basePrice} Ft (was ${compareAtPrice} Ft)`
        : `${basePrice} Ft`;
      console.log(`  ✓ ${strapiProduct.name}: ${priceInfo}`);
      updated++;
    } else {
      console.log(`  ✗ Failed: ${strapiProduct.name}`);
    }

    await delay(30);

    if (updated % 30 === 0 && updated > 0) {
      console.log(`\n  Progress: ${updated} updated...\n`);
    }
  }

  console.log('\n════════════════════════════════════════════');
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped (no price): ${skipped}`);
  console.log(`❓ Not found in Strapi: ${notFound}`);
  console.log('════════════════════════════════════════════\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
