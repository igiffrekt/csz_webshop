/**
 * WooCommerce to Strapi Migration Script
 *
 * This script imports products and categories from a WooCommerce CSV export
 * into Strapi CMS.
 *
 * Usage:
 *   npx tsx scripts/migration/woocommerce-import.ts data/woocommerce-products.csv
 *
 * Required environment variables:
 *   STRAPI_URL - Strapi base URL (default: http://localhost:1337)
 *   STRAPI_ADMIN_TOKEN - Strapi API token with write access
 */

import fs from 'fs';
import { parse } from 'csv-parse/sync';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

interface WooProduct {
  ID: string;
  Type: string;
  SKU: string;
  Name: string;
  Published: string;
  'Short description': string;
  Description: string;
  'Regular price': string;
  'Sale price': string;
  Categories: string;
  Images: string;
  Stock: string;
  Weight: string;
  'Tax status': string;
  'Tax class': string;
  'In stock?': string;
  Backorders: string;
  'Sold individually?': string;
  'Allow customer reviews?': string;
  'Purchase note': string;
  'Attribute 1 name': string;
  'Attribute 1 value(s)': string;
  'Attribute 1 visible': string;
  'Attribute 1 global': string;
}

interface CategoryMapping {
  name: string;
  id: number;
  slug: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry ${i + 1}/${retries}...`);
      await delay(1000 * (i + 1));
    }
  }
  throw new Error('Max retries exceeded');
}

async function getExistingCategories(): Promise<CategoryMapping[]> {
  try {
    const response = await fetchWithRetry(
      `${STRAPI_URL}/api/categories?pagination[pageSize]=100`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.warn('Failed to fetch existing categories');
      return [];
    }

    const data = await response.json();
    return data.data.map((cat: any) => ({
      name: cat.name,
      id: cat.id,
      slug: cat.slug,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function importCategories(products: WooProduct[]): Promise<Map<string, number>> {
  console.log('\n📁 Importing Categories...\n');

  // Get existing categories
  const existingCategories = await getExistingCategories();
  const categoryMap = new Map<string, number>();

  existingCategories.forEach((cat) => {
    categoryMap.set(cat.name.toLowerCase(), cat.id);
  });

  // Extract unique categories from products
  const categoriesSet = new Set<string>();
  products.forEach((p) => {
    if (p.Categories) {
      // WooCommerce uses ">" for hierarchy, e.g., "Parent > Child"
      p.Categories.split(',').forEach((catPath) => {
        const parts = catPath.split('>').map((s) => s.trim());
        parts.forEach((cat) => {
          if (cat) categoriesSet.add(cat);
        });
      });
    }
  });

  const categories = Array.from(categoriesSet);
  console.log(`Found ${categories.length} unique categories`);

  let created = 0;
  let skipped = 0;

  for (const categoryName of categories) {
    // Skip if already exists
    if (categoryMap.has(categoryName.toLowerCase())) {
      skipped++;
      continue;
    }

    const slug = slugify(categoryName);

    try {
      const response = await fetchWithRetry(`${STRAPI_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            name: categoryName,
            slug,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        categoryMap.set(categoryName.toLowerCase(), result.data.id);
        console.log(`  ✓ Created: ${categoryName}`);
        created++;
      } else {
        const error = await response.json();
        if (error.error?.message?.includes('unique')) {
          console.log(`  ⚠ Already exists: ${categoryName}`);
          skipped++;
        } else {
          console.log(`  ✗ Error: ${categoryName}`, error.error?.message);
        }
      }

      await delay(100); // Rate limiting
    } catch (error) {
      console.error(`  ✗ Failed: ${categoryName}`, error);
    }
  }

  console.log(`\nCategories: ${created} created, ${skipped} skipped`);
  return categoryMap;
}

async function importProducts(
  products: WooProduct[],
  categoryMap: Map<string, number>
): Promise<void> {
  console.log('\n📦 Importing Products...\n');

  // Filter to simple products only (skip variable parents)
  const simpleProducts = products.filter(
    (p) => p.Type === 'simple' || p.Type === 'variation'
  );

  console.log(`Processing ${simpleProducts.length} simple products...`);

  let created = 0;
  let errors = 0;
  let skipped = 0;

  for (const product of simpleProducts) {
    // Skip unpublished products
    if (product.Published !== '1') {
      skipped++;
      continue;
    }

    const slug = slugify(product.Name);

    // Get first category ID
    let categoryId: number | null = null;
    if (product.Categories) {
      const firstCategory = product.Categories.split(',')[0]
        .split('>')
        .pop()
        ?.trim();
      if (firstCategory) {
        categoryId = categoryMap.get(firstCategory.toLowerCase()) || null;
      }
    }

    // Parse prices
    const regularPrice = parseFloat(product['Regular price']) || 0;
    const salePrice = parseFloat(product['Sale price']) || null;

    // Determine stock
    const stock =
      product['In stock?'] === '1'
        ? parseInt(product.Stock) || 10
        : 0;

    // Clean HTML from description
    const cleanDescription = (html: string) => {
      if (!html) return '';
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    };

    const productData = {
      data: {
        name: product.Name,
        slug,
        sku: product.SKU || `WOO-${product.ID}`,
        shortDescription: product['Short description'] || '',
        description: cleanDescription(product.Description),
        basePrice: salePrice || regularPrice,
        compareAtPrice: salePrice ? regularPrice : null,
        stock,
        isActive: true,
        isFeatured: false,
        isOnSale: !!salePrice,
        categories: categoryId ? [categoryId] : [],
      },
    };

    try {
      const response = await fetchWithRetry(`${STRAPI_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        console.log(`  ✓ ${product.Name}`);
        created++;
      } else {
        const error = await response.json();
        if (error.error?.message?.includes('unique')) {
          console.log(`  ⚠ Already exists: ${product.Name}`);
          skipped++;
        } else {
          console.log(`  ✗ ${product.Name}: ${error.error?.message}`);
          errors++;
        }
      }

      await delay(100); // Rate limiting
    } catch (error) {
      console.error(`  ✗ Failed: ${product.Name}`, error);
      errors++;
    }
  }

  console.log(`\nProducts: ${created} created, ${skipped} skipped, ${errors} errors`);
}

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   WooCommerce to Strapi Migration Tool     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const csvPath = process.argv[2] || 'data/woocommerce-products.csv';

  // Validate inputs
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    console.log('\nUsage: npx tsx scripts/migration/woocommerce-import.ts <csv-file>');
    process.exit(1);
  }

  if (!STRAPI_TOKEN) {
    console.error('❌ STRAPI_ADMIN_TOKEN environment variable is required');
    console.log('\nSet it with: export STRAPI_ADMIN_TOKEN=your-api-token');
    process.exit(1);
  }

  // Test connection
  console.log(`Testing connection to ${STRAPI_URL}...`);
  try {
    const healthCheck = await fetch(`${STRAPI_URL}/api/products?pagination[limit]=1`, {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    });
    if (!healthCheck.ok) {
      throw new Error(`API returned ${healthCheck.status}`);
    }
    console.log('✓ Connected to Strapi\n');
  } catch (error) {
    console.error('❌ Cannot connect to Strapi:', error);
    process.exit(1);
  }

  // Parse CSV
  console.log(`Reading CSV: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const products: WooProduct[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  console.log(`✓ Loaded ${products.length} rows from CSV\n`);

  // Show product type breakdown
  const types = products.reduce(
    (acc, p) => {
      acc[p.Type] = (acc[p.Type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  console.log('Product types found:');
  Object.entries(types).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });

  // Import in order
  const categoryMap = await importCategories(products);
  await importProducts(products, categoryMap);

  console.log('\n════════════════════════════════════════════');
  console.log('✅ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Review imported products in Strapi admin');
  console.log('2. Upload product images');
  console.log('3. Add certifications and specifications');
  console.log('4. Publish products when ready');
  console.log('════════════════════════════════════════════\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
