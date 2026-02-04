/**
 * Fix Strapi product prices by importing correct values from WooCommerce
 *
 * WooCommerce stores prices as whole HUF integers (e.g., 39907 = 39,907 Ft)
 * This script updates Strapi products to match WooCommerce prices by SKU
 */

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '9e09250230981f354d3791036c7e28450ecdb2a46432bc12b60f4a52504fabf3c14ea18edaf111d2152ff20769b8715e9890a9e7815a087a2728a163008af3d6d64660e5d52ef8b21db37d07618f550aaf8705dde242b7e9984d4c6d7def71e7ea876c421279c41157ca7c2447a442c64b5988ee20e32cdee1be7eb6f6878996';

const WOOCOMMERCE_URL = 'https://csz.wedopixels.hu';
const CONSUMER_KEY = 'ck_42b6c2c98110fef1fdc8b6ddc0bb4705bb927499';
const CONSUMER_SECRET = 'cs_f679a2af5daee40e595485924749f4daeec9fd0f';

interface WooProduct {
  id: number;
  name: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
}

interface StrapiProduct {
  id: number;
  documentId: string;
  name: string;
  sku: string;
  basePrice: number;
  compareAtPrice: number | null;
}

async function fetchAllWooProducts(): Promise<WooProduct[]> {
  const allProducts: WooProduct[] = [];
  let page = 1;
  const perPage = 100;

  console.log('Fetching products from WooCommerce...');

  while (true) {
    const url = `${WOOCOMMERCE_URL}/wp-json/wc/v3/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&per_page=${perPage}&page=${page}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status}`);
    }

    const products: WooProduct[] = await response.json();
    allProducts.push(...products);

    console.log(`  Page ${page}: ${products.length} products`);

    if (products.length < perPage) {
      break;
    }
    page++;
  }

  return allProducts;
}

async function fetchAllStrapiProducts(): Promise<StrapiProduct[]> {
  const allProducts: StrapiProduct[] = [];
  let page = 1;
  const pageSize = 100;

  console.log('Fetching products from Strapi...');

  while (true) {
    const url = `${STRAPI_URL}/api/products?pagination[page]=${page}&pagination[pageSize]=${pageSize}&fields[0]=name&fields[1]=sku&fields[2]=basePrice&fields[3]=compareAtPrice`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (STRAPI_API_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    allProducts.push(...data.data);

    console.log(`  Page ${page}: ${data.data.length} products`);

    if (data.data.length < pageSize) {
      break;
    }
    page++;
  }

  return allProducts;
}

async function updateStrapiPrice(documentId: string, basePrice: number, compareAtPrice: number | null): Promise<void> {
  const url = `${STRAPI_URL}/api/products/${documentId}`;

  const body: { basePrice: number; compareAtPrice?: number | null } = {
    basePrice,
    compareAtPrice: compareAtPrice || null,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ data: body }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update: ${response.status} - ${error}`);
  }
}

async function main() {
  // Fetch all products from both systems
  const wooProducts = await fetchAllWooProducts();
  const strapiProducts = await fetchAllStrapiProducts();

  console.log(`\nWooCommerce: ${wooProducts.length} products`);
  console.log(`Strapi: ${strapiProducts.length} products`);

  // Create SKU -> WooCommerce product map
  const wooBysku: Map<string, WooProduct> = new Map();
  for (const p of wooProducts) {
    if (p.sku) {
      wooBysku.set(p.sku, p);
    }
  }

  console.log('\n--- Updating Strapi prices from WooCommerce ---\n');

  let updated = 0;
  let skipped = 0;
  let notFound = 0;
  let errors = 0;

  for (const strapiProduct of strapiProducts) {
    const wooProduct = wooBysku.get(strapiProduct.sku);

    if (!wooProduct) {
      console.log(`NOT FOUND in WooCommerce: ${strapiProduct.name} (SKU: ${strapiProduct.sku})`);
      notFound++;
      continue;
    }

    const wooPrice = parseInt(wooProduct.price, 10) || 0;
    const wooRegularPrice = parseInt(wooProduct.regular_price, 10) || 0;
    const wooSalePrice = parseInt(wooProduct.sale_price, 10) || 0;

    // Determine base price and compare at price
    let newBasePrice: number;
    let newCompareAtPrice: number | null = null;

    if (wooSalePrice > 0 && wooRegularPrice > wooSalePrice) {
      // On sale: base price is sale price, compare at is regular
      newBasePrice = wooSalePrice;
      newCompareAtPrice = wooRegularPrice;
    } else {
      // Not on sale: base price is price/regular_price
      newBasePrice = wooPrice || wooRegularPrice;
    }

    // Skip if price hasn't changed
    if (strapiProduct.basePrice === newBasePrice && strapiProduct.compareAtPrice === newCompareAtPrice) {
      skipped++;
      continue;
    }

    try {
      await updateStrapiPrice(strapiProduct.documentId, newBasePrice, newCompareAtPrice);
      console.log(`OK: ${strapiProduct.name}`);
      console.log(`    ${strapiProduct.basePrice} → ${newBasePrice}${newCompareAtPrice ? ` (was: ${newCompareAtPrice})` : ''}`);
      updated++;
    } catch (error) {
      console.error(`ERROR: ${strapiProduct.name} - ${error}`);
      errors++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (unchanged): ${skipped}`);
  console.log(`Not found in WooCommerce: ${notFound}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
