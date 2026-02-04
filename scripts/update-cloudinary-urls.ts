/**
 * Update Products with Cloudinary URLs
 *
 * Reads cloudinary-urls.json and updates each product's cloudinaryImageUrl field
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

interface CloudinaryMapping {
  product_id: string;
  product_name: string;
  original_url: string;
  cloudinary_url: string;
}

async function updateProduct(documentId: string, cloudinaryUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/products/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          cloudinaryImageUrl: cloudinaryUrl,
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error(`  Error updating ${documentId}:`, error);
    return false;
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('Update Products with Cloudinary URLs');
  console.log('='.repeat(50));
  console.log(`Strapi: ${STRAPI_URL}`);
  console.log(`Token: ${STRAPI_API_TOKEN ? '[OK]' : '[MISSING]'}`);
  console.log('');

  if (!STRAPI_API_TOKEN) {
    console.error('Error: STRAPI_API_TOKEN is required');
    process.exit(1);
  }

  // Read cloudinary URLs mapping
  const mappingPath = join(__dirname, 'cloudinary-urls.json');
  const mappings: CloudinaryMapping[] = JSON.parse(
    readFileSync(mappingPath, 'utf-8')
  );

  console.log(`Found ${mappings.length} products to update\n`);

  let updated = 0;
  let errors = 0;

  for (let i = 0; i < mappings.length; i++) {
    const mapping = mappings[i];
    const name = mapping.product_name.substring(0, 40);

    process.stdout.write(`[${i + 1}/${mappings.length}] ${name}... `);

    const success = await updateProduct(mapping.product_id, mapping.cloudinary_url);

    if (success) {
      console.log('[OK]');
      updated++;
    } else {
      console.log('[ERROR]');
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Update Summary');
  console.log('='.repeat(50));
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors:  ${errors}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
