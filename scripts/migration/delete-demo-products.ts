/**
 * Delete test/demo products that are not fire safety related
 */
import fs from 'fs';
import path from 'path';

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
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

// Keywords that indicate test/demo products (not fire safety)
const demoKeywords = [
  'wine', 'zinfandel', 'crimes', 'snoop',
  'table', 'oak', 'georg',
  'elho', 'cilinder', 'terracotta', 'green basics',
  'bragg', 'vinegar', 'ginger lemon',
  'earth rated', 'poop bags', 'lavender',
  'glucometer', 'accu-chek', 'test strips',
  'face masks', 'disposable',
  'eyeglasses', 'rim round',
  'renaissance', 'memoir', 'manifesto',
  'ravenswood', 'novel', 'phillippa',
  'teszt termék'
];

function isDemoProduct(name: string): boolean {
  const lowerName = name.toLowerCase();
  return demoKeywords.some(keyword => lowerName.includes(keyword.toLowerCase()));
}

async function main() {
  console.log('Finding and deleting test/demo products...\n');

  // Get all products
  const products: any[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `${STRAPI_URL}/api/products?pagination[page]=${page}&pagination[pageSize]=100`,
      { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
    );

    if (!res.ok) {
      console.error('Failed to fetch products:', res.status);
      return;
    }

    const data = await res.json();
    if (!data.data || data.data.length === 0) break;

    products.push(...data.data);
    if (data.data.length < 100) break;
    page++;
  }

  console.log(`Total products: ${products.length}\n`);

  // Find demo products
  const demoProducts = products.filter(p => isDemoProduct(p.name));
  
  console.log(`Found ${demoProducts.length} test/demo products to delete:\n`);
  demoProducts.forEach(p => console.log(`  - ${p.name}`));
  
  if (demoProducts.length === 0) {
    console.log('\nNo demo products found.');
    return;
  }

  console.log('\nDeleting...\n');

  let deleted = 0;
  let failed = 0;

  for (const product of demoProducts) {
    try {
      const res = await fetch(
        `${STRAPI_URL}/api/products/${product.documentId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${STRAPI_TOKEN}` }
        }
      );

      if (res.ok) {
        console.log(`  ✓ Deleted: ${product.name}`);
        deleted++;
      } else {
        const error = await res.text();
        console.log(`  ✗ Failed: ${product.name} - ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.log(`  ✗ Error: ${product.name} - ${err}`);
      failed++;
    }
  }

  console.log(`\n════════════════════════════════════════`);
  console.log(`✅ Deleted: ${deleted}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`════════════════════════════════════════\n`);
}

main().catch(console.error);
