// Script to update product counts for all categories
// Run with: npx tsx scripts/update-category-counts.ts

import 'dotenv/config';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';

async function fetchStrapi(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const res = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Strapi API error: ${res.status} ${errorText}`);
  }
  return res.json();
}

async function updateCategoryCounts() {
  console.log('Fetching all categories...');

  // Fetch all categories
  const categoriesResponse = await fetchStrapi('/categories?pagination[pageSize]=100');
  const categories = categoriesResponse.data;

  console.log(`Found ${categories.length} categories`);

  for (const category of categories) {
    // Count products in this category
    const productsResponse = await fetchStrapi(
      `/products?filters[categories][id][$eq]=${category.id}&pagination[pageSize]=1`
    );
    const productCount = productsResponse.meta.pagination.total;

    console.log(`${category.name}: ${productCount} products`);

    // Update the category with the count
    await fetchStrapi(`/categories/${category.documentId}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          productCount: productCount,
        },
      }),
    });
  }

  console.log('\nAll category counts updated!');
}

updateCategoryCounts().catch(console.error);
