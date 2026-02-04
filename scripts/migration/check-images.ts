/**
 * Check and diagnose product image issues
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
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

async function main() {
  console.log('Checking image status...\n');

  // Get all files
  const filesRes = await fetch(`${STRAPI_URL}/api/upload/files`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });
  const files = await filesRes.json();
  console.log(`Total files in Strapi: ${files.length}`);

  // Create file ID set
  const fileIds = new Set(files.map((f: any) => f.id));

  // Get products with images
  let page = 1;
  let productsWithImages = 0;
  let productsWithValidImages = 0;
  let productsWithInvalidImages = 0;
  let productsWithoutImages = 0;

  while (true) {
    const res = await fetch(
      `${STRAPI_URL}/api/products?populate=images&pagination[page]=${page}&pagination[pageSize]=100`,
      { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
    );
    const data = await res.json();
    if (!data.data || data.data.length === 0) break;

    for (const product of data.data) {
      if (!product.images || product.images.length === 0) {
        productsWithoutImages++;
      } else {
        productsWithImages++;
        const imageId = product.images[0].id;
        if (fileIds.has(imageId)) {
          productsWithValidImages++;
        } else {
          productsWithInvalidImages++;
          console.log(`  Invalid: ${product.name} (image id: ${imageId})`);
        }
      }
    }

    if (data.data.length < 100) break;
    page++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`Products with images: ${productsWithImages}`);
  console.log(`  - Valid references: ${productsWithValidImages}`);
  console.log(`  - Invalid references: ${productsWithInvalidImages}`);
  console.log(`Products without images: ${productsWithoutImages}`);
  console.log(`\nTotal products: ${productsWithImages + productsWithoutImages}`);
}

main().catch(console.error);
