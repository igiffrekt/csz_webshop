/**
 * Test processing a single image with Cloudinary
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

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

cloudinary.config({
  cloud_name: 'pixelkripta',
  api_key: '526256412348358',
  api_secret: 'Vsxr8E0YvZLdMuqQNjJgqMT_FXI',
});

async function main() {
  console.log('Testing single image processing...\n');

  // Get first product with image
  const res = await fetch(
    `${STRAPI_URL}/api/products?populate=images&pagination[limit]=1&filters[images][id][$notNull]=true`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
  );
  const data = await res.json();
  const product = data.data[0];

  if (!product || !product.images || product.images.length === 0) {
    console.log('No product with image found');
    return;
  }

  console.log(`Product: ${product.name}`);
  console.log(`Image URL: ${product.images[0].url}`);

  // Download
  const imageUrl = `${STRAPI_URL}${product.images[0].url}`;
  console.log(`\nDownloading from: ${imageUrl}`);

  const imageRes = await fetch(imageUrl);
  console.log(`Response status: ${imageRes.status}`);
  console.log(`Content-Type: ${imageRes.headers.get('content-type')}`);

  if (!imageRes.ok) {
    console.log('Download failed');
    return;
  }

  const buffer = Buffer.from(await imageRes.arrayBuffer());
  console.log(`Buffer size: ${buffer.length} bytes`);

  // Check magic bytes
  const magic = buffer.slice(0, 8).toString('hex');
  console.log(`Magic bytes: ${magic}`);

  // Save original for inspection
  fs.writeFileSync('/tmp/test_original.png', buffer);
  console.log('Saved original to /tmp/test_original.png');

  // Try Sharp
  console.log('\nNormalizing with Sharp...');
  const normalized = await sharp(buffer).png().toBuffer();
  console.log(`Normalized size: ${normalized.length} bytes`);
  fs.writeFileSync('/tmp/test_normalized.png', normalized);
  console.log('Saved normalized to /tmp/test_normalized.png');

  // Upload to Cloudinary
  console.log('\nUploading to Cloudinary...');
  const base64 = `data:image/png;base64,${normalized.toString('base64')}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: 'csz_test',
    transformation: [
      { effect: 'background_removal' },
      { format: 'png' }
    ],
  });

  console.log(`Cloudinary URL: ${result.secure_url}`);

  // Download processed
  console.log('\nDownloading processed image...');
  const processedRes = await fetch(result.secure_url);
  const processedBuffer = Buffer.from(await processedRes.arrayBuffer());
  fs.writeFileSync('/tmp/test_processed.png', processedBuffer);
  console.log('Saved processed to /tmp/test_processed.png');

  // Cleanup Cloudinary
  await cloudinary.uploader.destroy(result.public_id);
  console.log('\nCleanup done');

  console.log('\n✓ Test completed successfully!');
  console.log('Check /tmp/test_*.png files to see results');
}

main().catch(console.error);
