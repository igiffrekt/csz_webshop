/**
 * Link Uploaded Images to Products
 *
 * This script links existing uploaded images in Strapi to products
 * by matching image filenames to product slugs.
 *
 * Usage:
 *   npx tsx scripts/migration/link-images.ts
 *
 * Required environment variables:
 *   STRAPI_URL - Strapi base URL (default: http://localhost:1337)
 *   STRAPI_ADMIN_TOKEN - Strapi API token with write access
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

interface StrapiProduct {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  sku: string;
  images: { id: number }[] | null;
}

interface FileInfo {
  id: number;
  name: string;
  hash: string;
  normalized: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric
    .replace(/masolata?/g, '') // Remove "masolat" suffix
    .replace(/scaled/g, '') // Remove "scaled"
    .replace(/hatternelkul/g, '') // Remove "hatter nelkul"
    .replace(/\d+$/g, ''); // Remove trailing numbers
}

function extractBaseName(hash: string): string {
  // Remove hash suffix from Strapi's hash field (e.g., "szurokosar_2_415baea7bd" -> "szurokosar_2")
  return hash.replace(/_[a-f0-9]{8,}$/i, '');
}

async function getAllFilesFromStrapi(): Promise<FileInfo[]> {
  console.log('Fetching all files from Strapi...');

  const response = await fetch(
    `${STRAPI_URL}/api/upload/files`,
    {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch files: ${response.status}`);
  }

  const allFilesRaw = await response.json();
  const allFiles: FileInfo[] = [];

  for (const file of allFilesRaw) {
    // Skip thumbnails and resized versions
    if (file.hash.startsWith('thumbnail_') ||
        file.hash.startsWith('small_') ||
        file.hash.startsWith('medium_') ||
        file.hash.startsWith('large_') ||
        file.hash.startsWith('xsmall_')) {
      continue;
    }

    const baseName = extractBaseName(file.hash);
    allFiles.push({
      id: file.id,
      name: file.name,
      hash: file.hash,
      normalized: normalizeForMatch(baseName),
    });
  }

  console.log(`  Found ${allFiles.length} original images (excluding thumbnails)`);
  return allFiles;
}

async function getAllProducts(): Promise<StrapiProduct[]> {
  console.log('Fetching all products from Strapi...');
  const allProducts: StrapiProduct[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const response = await fetch(
      `${STRAPI_URL}/api/products?populate=images&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) break;

    allProducts.push(...data.data);

    if (data.data.length < pageSize) break;
    page++;
  }

  console.log(`  Found ${allProducts.length} products`);
  return allProducts;
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

function findMatchingFile(
  product: StrapiProduct,
  files: FileInfo[]
): FileInfo | null {
  const productSlug = product.slug || '';
  const productName = product.name || '';
  const productNorm = normalizeForMatch(productSlug || productName);

  // Strategy 1: Exact normalized match
  for (const file of files) {
    if (file.normalized === productNorm) {
      return file;
    }
  }

  // Strategy 2: File contains product name
  for (const file of files) {
    if (productNorm.length > 5 && file.normalized.includes(productNorm)) {
      return file;
    }
  }

  // Strategy 3: Product name contains file name
  for (const file of files) {
    if (file.normalized.length > 5 && productNorm.includes(file.normalized)) {
      return file;
    }
  }

  // Strategy 4: Word-based matching (at least 2 common words)
  const productWords = productNorm.match(/[a-z]{3,}/g) || [];
  for (const file of files) {
    const fileWords = file.normalized.match(/[a-z]{3,}/g) || [];
    const matches = productWords.filter(w => fileWords.includes(w));
    if (matches.length >= 2) {
      return file;
    }
  }

  return null;
}

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Link Images to Products                  ║');
  console.log('╚════════════════════════════════════════════╝\n');

  if (!STRAPI_TOKEN) {
    console.error('❌ STRAPI_ADMIN_TOKEN environment variable is required');
    process.exit(1);
  }

  // Fetch data
  const products = await getAllProducts();
  const files = await getAllFilesFromStrapi();

  // Filter products without images
  const productsWithoutImages = products.filter(
    (p) => !p.images || p.images.length === 0
  );
  console.log(`\nProducts without images: ${productsWithoutImages.length}`);
  console.log(`Available files: ${files.length}\n`);

  if (productsWithoutImages.length === 0) {
    console.log('All products already have images!');
    return;
  }

  if (files.length === 0) {
    console.log('❌ No files found in Strapi. Upload images first.');
    return;
  }

  // Track used files
  const usedFileIds = new Set<number>();

  console.log('Matching and linking images...\n');

  let linked = 0;
  let notFound = 0;
  const unmatched: string[] = [];

  for (const product of productsWithoutImages) {
    // Filter out already used files
    const availableFiles = files.filter(f => !usedFileIds.has(f.id));
    const matchingFile = findMatchingFile(product, availableFiles);

    if (matchingFile) {
      const success = await linkImageToProduct(product.documentId, matchingFile.id);
      if (success) {
        console.log(`  ✓ ${product.name} → ${matchingFile.name}`);
        usedFileIds.add(matchingFile.id);
        linked++;
      } else {
        console.log(`  ✗ Failed: ${product.name}`);
      }
      await delay(30);
    } else {
      unmatched.push(product.name);
      notFound++;
    }
  }

  console.log('\n════════════════════════════════════════════');
  console.log(`✅ Linked: ${linked} products`);
  console.log(`⚠️  No match: ${notFound} products`);
  console.log('════════════════════════════════════════════\n');

  if (unmatched.length > 0 && unmatched.length <= 30) {
    console.log('Products without matching images:');
    unmatched.forEach(name => console.log(`  - ${name}`));
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
