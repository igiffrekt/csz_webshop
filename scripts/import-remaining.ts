/**
 * Import remaining failed products
 */

import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../apps/web/.env.local') });
config({ path: resolve(__dirname, '../.env') });

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// Remaining products from failed list
const remainingProducts = [
  'Állványcső C-52',
  'Műanyag sugárcső C-52',
  'Gyűjtő tűzoltótömlőhőz A/B-B',
  'Háromágú osztó B-CC',
  'Szűrőkosár C-52',
  'Mérősugárcső "D"-1"os falitűzcsapok vízhozamának mérése',
  'Egyszerű sugárcső C-52',
  'Négyágú osztó B-C-B-C',
  'Szűrőkosár B-75',
  'Mérősugárcső "C"-2"-os fali tűzcsapok vízhozamának mérése',
  'Mérősugárcső "B"-tűzcsapok mérése',
  'Szűrőkosár A-110, Lábszeleppel / Tanúsítvánnyal/',
  'Műanyag sugárcső D-25 menettel',
  'Műanyag sugárcső D-25 csonkkapoccsal',
  'Műanyag sugárcső D-25 tömlővéggel',
  'Háromágú osztó B csonk nélkül',
  'Gyűjtő "A" kapocs nélkül"',
  'Négyágú osztó B csonk nélkül',
  'Állványcső 1"-1" KB-BB csappal',
  'Szűrőkosár lábszeleppel A-110, piros por szórt',
  'Háromágú Osztó B-BB',
  'Golyóscsap 1" Föld feletti tűzcsaphoz (vízlopó)',
  'Egyszerű Szűrőkosár A-110',
];

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
  'Tömeg (kg)': string;
  'Raktáron?': string;
  'Készlet': string;
  'Kiemelt?': string;
}

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

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Strapi error ${response.status}: ${text}`);
  }

  return JSON.parse(text);
}

function slugify(text: string, sku: string): string {
  let slug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Always add SKU suffix to ensure uniqueness
  const skuSlug = sku
    .toLowerCase()
    .replace(/[^\w-]/g, '-')
    .replace(/-+/g, '-')
    .trim();

  return `${slug}-${skuSlug}`;
}

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
      .on('data', (row: WooCSVRow) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', reject);
  });
}

const categoryCache = new Map<string, number>();

async function getOrCreateCategory(categoryPath: string): Promise<number[]> {
  const categoryIds: number[] = [];
  const categories = categoryPath.split(',').map(c => c.trim()).filter(Boolean);

  for (const cat of categories) {
    const parts = cat.split('>').map(p => p.trim()).filter(Boolean);
    let parentId: number | null = null;

    for (const part of parts) {
      const cacheKey = parentId ? `${parentId}:${part}` : part;

      if (categoryCache.has(cacheKey)) {
        parentId = categoryCache.get(cacheKey)!;
        continue;
      }

      const slug = part
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      try {
        const existing = await strapiRequest(
          `/categories?filters[slug][$eq]=${encodeURIComponent(slug)}`
        );

        if (existing.data && existing.data.length > 0) {
          categoryCache.set(cacheKey, existing.data[0].id);
          parentId = existing.data[0].id;
          continue;
        }

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
      } catch (error) {
        console.error(`  ⚠️ Category error for ${part}:`, error);
      }
    }

    if (parentId) {
      categoryIds.push(parentId);
    }
  }

  return categoryIds;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    console.error('Usage: npx tsx scripts/import-remaining.ts "path/to/csv"');
    process.exit(1);
  }

  console.log('🔧 Importing remaining products...\n');

  const rows = await parseCSV(csvPath);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const name = row['Név']?.trim();
    if (!name || !remainingProducts.includes(name)) continue;

    if (row['Típus'] !== 'simple' || row['Közzétéve'] !== '1') {
      console.log(`  ⏭️ Skipping (unpublished/variable): ${name}`);
      skipped++;
      continue;
    }

    try {
      const sku = row['Cikkszám']?.trim() || `WOO-${row['Azonosító']}`;
      const slug = slugify(name, sku);

      // Check by SKU first
      const existingBySku = await strapiRequest(
        `/products?filters[sku][$eq]=${encodeURIComponent(sku)}`
      );

      if (existingBySku.data && existingBySku.data.length > 0) {
        console.log(`  ⏭️ Exists (SKU): ${name}`);
        skipped++;
        continue;
      }

      // Check by slug
      const existingBySlug = await strapiRequest(
        `/products?filters[slug][$eq]=${encodeURIComponent(slug)}`
      );

      if (existingBySlug.data && existingBySlug.data.length > 0) {
        console.log(`  ⏭️ Exists (slug): ${name}`);
        skipped++;
        continue;
      }

      const priceStr = row['Normál ár']?.replace(/\s/g, '').replace(',', '.') || '0';
      const salePriceStr = row['Akciós ár']?.replace(/\s/g, '').replace(',', '.') || '0';

      const regularPrice = Math.round(parseFloat(priceStr) * 100) || 0;
      const salePrice = Math.round(parseFloat(salePriceStr) * 100) || 0;

      const basePrice = salePrice > 0 ? salePrice : regularPrice;
      const compareAtPrice = salePrice > 0 && regularPrice > salePrice ? regularPrice : null;

      const weightStr = row['Tömeg (kg)']?.replace(',', '.') || '0';
      const weight = parseFloat(weightStr) || 0;

      const stockStr = row['Készlet']?.trim() || '0';
      const stock = parseInt(stockStr, 10) || 0;
      const inStock = row['Raktáron?'] === '1';

      let categoryIds: number[] = [];
      if (row['Kategória']) {
        categoryIds = await getOrCreateCategory(row['Kategória']);
      }

      console.log(`  Creating: ${name} -> slug: ${slug}`);

      const productData = {
        name: name,
        slug: slug,
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

      await delay(100);
    } catch (error: any) {
      console.error(`  ❌ Failed: ${name}`);
      console.error(`     Error: ${error.message}`);
      failed++;
      await delay(200);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);
}

main();
