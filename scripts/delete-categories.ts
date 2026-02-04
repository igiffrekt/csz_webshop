/**
 * Delete specified categories and products in them from Strapi
 */

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '9e09250230981f354d3791036c7e28450ecdb2a46432bc12b60f4a52504fabf3c14ea18edaf111d2152ff20769b8715e9890a9e7815a087a2728a163008af3d6d64660e5d52ef8b21db37d07618f550aaf8705dde242b7e9984d4c6d7def71e7ea876c421279c41157ca7c2447a442c64b5988ee20e32cdee1be7eb6f6878996';

const CATEGORIES_TO_DELETE = [
  'accessory',
  'armchair',
  'artistry-palette',
  'automotive-body-kits',
  'automotive-doors',
  'automotive-glass',
  'baby',
  'bakery',
  'beverages',
  'capsule-collectible',
  'chair',
  'hair-styling',
  'headlights-lighting',
  'kitchenware',
  'milk',
  'pantry',
  'seasonal-grocery',
  'table',
  'toys',
  'veggie-spirals',
  'wooden-trinket',
  'yoghurt',
  'kategoria',
];

interface StrapiCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

interface StrapiProduct {
  id: number;
  documentId: string;
  name: string;
}

async function strapiFetch(endpoint: string, options: RequestInit = {}, expectJson = true) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
  };

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Strapi API error: ${response.status} - ${text}`);
  }

  if (!expectJson) {
    return { success: true };
  }

  const text = await response.text();
  if (!text) {
    return { success: true };
  }

  return JSON.parse(text);
}

async function findCategoriesBySlug(slugs: string[]): Promise<StrapiCategory[]> {
  const categories: StrapiCategory[] = [];

  for (const slug of slugs) {
    try {
      const response = await strapiFetch(`/categories?filters[slug][$eq]=${slug}`);
      if (response.data && response.data.length > 0) {
        categories.push(response.data[0]);
      }
    } catch (error) {
      console.log(`Category not found: ${slug}`);
    }
  }

  return categories;
}

async function findProductsInCategory(categoryDocumentId: string): Promise<StrapiProduct[]> {
  const response = await strapiFetch(
    `/products?filters[categories][documentId][$eq]=${categoryDocumentId}&pagination[pageSize]=100`
  );
  return response.data || [];
}

async function deleteProduct(documentId: string): Promise<void> {
  await strapiFetch(`/products/${documentId}`, { method: 'DELETE' }, false);
}

async function deleteCategory(documentId: string): Promise<void> {
  await strapiFetch(`/categories/${documentId}`, { method: 'DELETE' }, false);
}

async function main() {
  console.log('Finding categories to delete...\n');

  const categories = await findCategoriesBySlug(CATEGORIES_TO_DELETE);

  console.log(`Found ${categories.length} categories to delete:\n`);
  categories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));

  let totalProductsDeleted = 0;
  let totalCategoriesDeleted = 0;

  // Delete products in each category first
  console.log('\n--- Deleting products in categories ---\n');

  for (const category of categories) {
    const products = await findProductsInCategory(category.documentId);

    if (products.length > 0) {
      console.log(`\n${category.name}: ${products.length} products`);

      for (const product of products) {
        try {
          await deleteProduct(product.documentId);
          console.log(`  Deleted: ${product.name}`);
          totalProductsDeleted++;
        } catch (error) {
          console.error(`  Failed to delete: ${product.name} - ${error}`);
        }
      }
    } else {
      console.log(`${category.name}: No products`);
    }
  }

  // Delete categories
  console.log('\n--- Deleting categories ---\n');

  for (const category of categories) {
    try {
      await deleteCategory(category.documentId);
      console.log(`Deleted category: ${category.name}`);
      totalCategoriesDeleted++;
    } catch (error) {
      console.error(`Failed to delete category: ${category.name} - ${error}`);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Products deleted: ${totalProductsDeleted}`);
  console.log(`Categories deleted: ${totalCategoriesDeleted}`);
}

main().catch(console.error);
