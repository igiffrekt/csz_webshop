/**
 * Debug image downloads for first 5 products
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

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
  console.log('Debugging image downloads...\n');

  // Get products with images
  const res = await fetch(
    `${STRAPI_URL}/api/products?populate=images&pagination[limit]=10`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
  );
  const data = await res.json();

  for (const product of data.data) {
    if (!product.images || product.images.length === 0) {
      console.log(`${product.name}: No images`);
      continue;
    }

    const image = product.images[0];
    console.log(`\n${product.name}:`);
    console.log(`  URL: ${image.url}`);
    console.log(`  ID: ${image.id}`);

    // Try to download
    const fullUrl = `${STRAPI_URL}${image.url}`;
    try {
      const res = await fetch(fullUrl);
      console.log(`  Status: ${res.status}`);
      console.log(`  Content-Type: ${res.headers.get('content-type')}`);

      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        console.log(`  Size: ${buffer.length} bytes`);
        console.log(`  Magic: ${buffer.slice(0, 4).toString('hex')}`);

        // Try Sharp
        try {
          const meta = await sharp(buffer).metadata();
          console.log(`  Format: ${meta.format} (${meta.width}x${meta.height})`);
        } catch (sharpErr) {
          console.log(`  Sharp error: ${sharpErr}`);
        }
      }
    } catch (err) {
      console.log(`  Fetch error: ${err}`);
    }
  }
}

main().catch(console.error);
