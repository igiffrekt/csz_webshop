/**
 * Make categories containing "szerelvenyszekreny" or "tuzcsapszekreny" in their slug
 * children of the "Tűzcsap szekrények" main category
 */

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '9e09250230981f354d3791036c7e28450ecdb2a46432bc12b60f4a52504fabf3c14ea18edaf111d2152ff20769b8715e9890a9e7815a087a2728a163008af3d6d64660e5d52ef8b21db37d07618f550aaf8705dde242b7e9984d4c6d7def71e7ea876c421279c41157ca7c2447a442c64b5988ee20e32cdee1be7eb6f6878996';

const PARENT_SLUG = 'tuzcsap-szekrenyek';
const CHILD_PATTERNS = ['szerelvenyszekreny', 'tuzcsapszekreny'];

interface StrapiCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

async function strapiFetch(endpoint: string, options: RequestInit = {}) {
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

  const text = await response.text();
  if (!text) {
    return { success: true };
  }

  return JSON.parse(text);
}

async function getAllCategories(): Promise<StrapiCategory[]> {
  const response = await strapiFetch('/categories?pagination[pageSize]=100');
  return response.data || [];
}

async function updateCategoryParent(documentId: string, parentDocumentId: string): Promise<void> {
  await strapiFetch(`/categories/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({
      data: {
        parent: parentDocumentId,
      },
    }),
  });
}

async function main() {
  console.log('Fetching all categories...\n');

  const categories = await getAllCategories();

  // Find the parent category
  const parentCategory = categories.find(cat => cat.slug === PARENT_SLUG);

  if (!parentCategory) {
    console.error(`Parent category "${PARENT_SLUG}" not found!`);
    return;
  }

  console.log(`Parent category: ${parentCategory.name} (${parentCategory.slug})`);
  console.log(`Document ID: ${parentCategory.documentId}\n`);

  // Find child categories (excluding the parent itself)
  const childCategories = categories.filter(cat => {
    if (cat.documentId === parentCategory.documentId) return false;
    return CHILD_PATTERNS.some(pattern => cat.slug.includes(pattern));
  });

  console.log(`Found ${childCategories.length} categories to update:\n`);
  childCategories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));

  // Update each child category
  console.log('\n--- Updating categories ---\n');

  let updated = 0;
  let errors = 0;

  for (const child of childCategories) {
    try {
      await updateCategoryParent(child.documentId, parentCategory.documentId);
      console.log(`✓ Updated: ${child.name}`);
      updated++;
    } catch (error) {
      console.error(`✗ Failed: ${child.name} - ${error}`);
      errors++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
