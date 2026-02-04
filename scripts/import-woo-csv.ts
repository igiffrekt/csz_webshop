/**
 * Import WooCommerce CSV export into Strapi
 *
 * Usage: npx tsx scripts/import-woo-csv.ts "path/to/export.csv"
 */

import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load env
config({ path: resolve(__dirname, '../apps/web/.env.local') });
config({ path: resolve(__dirname, '../.env') });

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

interface WooCSVRow {
  'Azonosító': string;
  'Típus': string;
  'Cikkszám': string;
  'Név': string;
  'Közzétéve': string;
  'Rövid leírás': string;
  'Leírás': string;
  'Normál ár': string;
  'Akciós ár': string;
  'Kategória': string;
  'Képek': string;
  'Tömeg (kg)': string;
  'Raktáron?': string;
  'Készlet': string;
  'Kiemelt?': string;
}

// Strapi API helpers
async function strapiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
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

// Helper to create slug from name
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Parse CSV file
async function parseCSV(filePath: string): Promise<WooCSVRow[]> {
  return new Promise((resolve, reject) => {
    const records: WooCSVRow[] = [];

    createReadStream(filePath, { encoding: 'utf-8' })
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          bom: true,
          relax_quotes: true,
          relax_column_count: true,
        })
      )
      .on('data', (row: WooCSVRow) => {
        records.push(row);
      })
      .on('end', () => resolve(records))
      .on('error', reject);
  });
}

// Category cache
const categoryCache = new Map<string, number>();

async function getOrCreateCategory(categoryPath: string): Promise<number[]> {
  // Categories can be nested like "Parent > Child > Grandchild"
  // or comma-separated like "Cat1, Cat2, Cat3"
  const categoryIds: number[] = [];

  // Split by comma first (multiple categories)
  const categories = categoryPath.split(',').map(c => c.trim()).filter(Boolean);

  for (const cat of categories) {
    // Handle nested categories (Parent > Child)
    const parts = cat.split('>').map(p => p.trim()).filter(Boolean);
    let parentId: number | null = null;

    for (const part of parts) {
      const cacheKey = parentId ? `${parentId}:${part}` : part;

      if (categoryCache.has(cacheKey)) {
        parentId = categoryCache.get(cacheKey)!;
        continue;
      }

      const slug = slugify(part);

      // Check if exists
      const existing = await strapiRequest(
        `/categories?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=parent`
      );

      if (existing.data && existing.data.length > 0) {
        const found = existing.data.find((c: any) => {
          if (!parentId) return true;
          return c.parent?.id === parentId;
        });

        if (found) {
          categoryCache.set(cacheKey, found.id);
          parentId = found.id;
          continue;
        }
      }

      // Create category
      const created = await strapiRequest('/categories', 'POST', {
        data: {
          name: part,
          slug: slug,
          parent: parentId,
          publishedAt: new Date().toISOString(),
        },
      });

      categoryCache.set(cacheKey, created.data.id);
      parentId = created.data.id;
      console.log(`  📁 Created category: ${part}`);
    }

    if (parentId) {
      categoryIds.push(parentId);
    }
  }

  return categoryIds;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function importProducts(rows: WooCSVRow[]): Promise<void> {
  console.log(`\n📦 Importing ${rows.length} products...\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    // Skip non-simple products (variable, grouped, etc.)
    if (row['Típus'] !== 'simple') {
      console.log(`  ⏭️  Skipping ${row['Típus']} product: ${row['Név']}`);
      skipped++;
      continue;
    }

    // Skip unpublished
    if (row['Közzétéve'] !== '1') {
      console.log(`  ⏭️  Skipping unpublished: ${row['Név']}`);
      skipped++;
      continue;
    }

    try {
      const sku = row['Cikkszám']?.trim() || `WOO-${row['Azonosító']}`;
      const name = row['Név']?.trim();

      if (!name) {
        console.log(`  ⏭️  Skipping row with no name`);
        skipped++;
        continue;
      }

      // Check if product already exists
      const existingBySku = await strapiRequest(
        `/products?filters[sku][$eq]=${encodeURIComponent(sku)}`
      );

      if (existingBySku.data && existingBySku.data.length > 0) {
        console.log(`  ⏭️  Product exists (SKU): ${name}`);
        skipped++;
        continue;
      }

      // Parse price (Hungarian format uses comma as decimal separator)
      const priceStr = row['Normál ár']?.replace(/\s/g, '').replace(',', '.') || '0';
      const salePriceStr = row['Akciós ár']?.replace(/\s/g, '').replace(',', '.') || '0';

      const regularPrice = Math.round(parseFloat(priceStr) * 100) || 0;
      const salePrice = Math.round(parseFloat(salePriceStr) * 100) || 0;

      // basePrice is the current selling price
      const basePrice = salePrice > 0 ? salePrice : regularPrice;
      // compareAtPrice is original price when on sale
      const compareAtPrice = salePrice > 0 && regularPrice > salePrice ? regularPrice : null;

      // Parse weight
      const weightStr = row['Tömeg (kg)']?.replace(',', '.') || '0';
      const weight = parseFloat(weightStr) || 0;

      // Parse stock
      const stockStr = row['Készlet']?.trim() || '0';
      const stock = parseInt(stockStr, 10) || 0;
      const inStock = row['Raktáron?'] === '1';

      // Get or create categories
      let categoryIds: number[] = [];
      if (row['Kategória']) {
        categoryIds = await getOrCreateCategory(row['Kategória']);
      }

      // Create product
      const productData = {
        name: name,
        slug: slugify(name),
        sku: sku,
        description: row['Leírás'] || null,
        shortDescription: row['Rövid leírás']?.substring(0, 500) || null,
        basePrice: basePrice,
        compareAtPrice: compareAtPrice,
        stock: inStock ? (stock || 999) : 0,
        weight: weight > 0 ? weight : null,
        isFeatured: row['Kiemelt?'] === '1',
        isOnSale: salePrice > 0 && salePrice < regularPrice,
        categories: categoryIds,
        publishedAt: new Date().toISOString(),
      };

      await strapiRequest('/products', 'POST', { data: productData });
      console.log(`  ✅ Created: ${name}`);
      created++;

      // Rate limiting
      await delay(50);
    } catch (error: any) {
      console.error(`  ❌ Failed: ${row['Név']} - ${error.message}`);
      failed++;
      await delay(200);
    }
  }

  console.log(`\n📊 Import Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);
}

async function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    console.error('Usage: npx tsx scripts/import-woo-csv.ts "path/to/export.csv"');
    process.exit(1);
  }

  console.log('🚀 Starting WooCommerce CSV import...\n');
  console.log(`Strapi: ${STRAPI_URL}`);
  console.log(`CSV: ${csvPath}\n`);

  try {
    // Test Strapi connection
    await strapiRequest('/categories?pagination[limit]=1');
    console.log('✅ Strapi connection OK\n');

    // Parse CSV
    console.log('📄 Parsing CSV file...');
    const rows = await parseCSV(csvPath);
    console.log(`   Found ${rows.length} rows\n`);

    // Import products
    await importProducts(rows);

    console.log('\n✅ Import complete!');
  } catch (error: any) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
