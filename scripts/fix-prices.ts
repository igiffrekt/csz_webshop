/**
 * Fix Product Prices Script
 *
 * The import script incorrectly multiplied prices by 100 (assuming cents/fillér),
 * but Hungarian Forint (HUF) doesn't use cents in practice.
 *
 * This script divides all prices by 100 to correct them.
 */

import 'dotenv/config';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

interface Product {
  id: number;
  documentId: string;
  name: string;
  basePrice: number;
  compareAtPrice: number | null;
}

async function getProducts(): Promise<Product[]> {
  const products: Product[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const response = await fetch(
      `${STRAPI_URL}/api/products?pagination[page]=${page}&pagination[pageSize]=${pageSize}&fields[0]=name&fields[1]=basePrice&fields[2]=compareAtPrice`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data = await response.json();
    products.push(...data.data);

    if (data.data.length < pageSize) {
      break;
    }
    page++;
  }

  return products;
}

async function updateProductPrice(
  documentId: string,
  basePrice: number,
  compareAtPrice: number | null
): Promise<boolean> {
  const response = await fetch(`${STRAPI_URL}/api/products/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
    body: JSON.stringify({
      data: {
        basePrice,
        compareAtPrice,
      },
    }),
  });

  return response.ok;
}

async function main() {
  console.log('='.repeat(50));
  console.log('Price Fix Script - Dividing all prices by 100');
  console.log('='.repeat(50));
  console.log(`Strapi URL: ${STRAPI_URL}`);
  console.log(`Token: ${STRAPI_API_TOKEN ? '[OK]' : '[MISSING]'}`);
  console.log('');

  if (!STRAPI_API_TOKEN) {
    console.error('Error: STRAPI_API_TOKEN is required');
    process.exit(1);
  }

  console.log('Fetching products...');
  const products = await getProducts();
  console.log(`Found ${products.length} products\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    const oldBase = product.basePrice;
    const oldCompare = product.compareAtPrice;

    // Skip if prices are already reasonable (< 1000000 fillér = < 10000 Ft)
    // This prevents double-fixing if script is run twice
    if (oldBase < 100000 && (oldCompare === null || oldCompare < 100000)) {
      console.log(`[SKIP] ${product.name.substring(0, 40)}... (prices look correct)`);
      skipped++;
      continue;
    }

    const newBase = Math.round(oldBase / 100);
    const newCompare = oldCompare ? Math.round(oldCompare / 100) : null;

    console.log(
      `[FIX] ${product.name.substring(0, 40)}... ${oldBase} -> ${newBase} Ft`
    );

    const success = await updateProductPrice(
      product.documentId,
      newBase,
      newCompare
    );

    if (success) {
      updated++;
    } else {
      console.log(`  [ERROR] Failed to update`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Price Fix Summary');
  console.log('='.repeat(50));
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors:  ${errors}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
