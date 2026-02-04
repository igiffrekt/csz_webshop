/**
 * Process Product Images: Remove Background & Add Shadow
 *
 * This script:
 * 1. Fetches all product images from Strapi
 * 2. Removes backgrounds using @imgly/background-removal-node
 * 3. Adds a soft drop shadow using Sharp
 * 4. Re-uploads processed images to Strapi
 *
 * Usage:
 *   npx tsx scripts/migration/process-images.ts
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Load .env.local
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

// Will be initialized lazily
let removeBackground: (input: Blob) => Promise<Blob>;

async function initBackgroundRemoval() {
  console.log('Loading AI model (first run downloads ~180MB)...');
  const { removeBackground: rb } = await import('@imgly/background-removal-node');
  removeBackground = rb;
  console.log('  Model loaded!\n');
}

interface StrapiProduct {
  id: number;
  documentId: string;
  name: string;
  images: { id: number; url: string; name: string }[];
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getProductsWithImages(): Promise<StrapiProduct[]> {
  console.log('Fetching products with images...');
  const products: StrapiProduct[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `${STRAPI_URL}/api/products?populate=images&pagination[page]=${page}&pagination[pageSize]=100`,
      { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) break;

    for (const product of data.data) {
      if (product.images && product.images.length > 0) {
        products.push({
          id: product.id,
          documentId: product.documentId,
          name: product.name,
          images: product.images,
        });
      }
    }

    if (data.data.length < 100) break;
    page++;
  }

  console.log(`  Found ${products.length} products with images\n`);
  return products;
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const fullUrl = url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
    const response = await fetch(fullUrl);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

async function processImage(imageBuffer: Buffer): Promise<Buffer> {
  // First, normalize the image to PNG using Sharp (fixes MIME type issues)
  const normalizedBuffer = await sharp(imageBuffer)
    .png()
    .toBuffer();

  // Convert to Blob for background removal with correct MIME type
  const blob = new Blob([normalizedBuffer], { type: 'image/png' });

  // Remove background
  const resultBlob = await removeBackground(blob);
  const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());

  // Get dimensions of the processed image
  const metadata = await sharp(resultBuffer).metadata();
  const { width = 800, height = 800 } = metadata;

  // Create shadow parameters
  const shadowOffset = 12;
  const shadowBlur = 25;
  const padding = 40;

  // Calculate new canvas size
  const newWidth = width + padding * 2 + shadowOffset;
  const newHeight = height + padding * 2 + shadowOffset;

  // Create a shadow layer (dark semi-transparent rectangle, blurred)
  // We'll composite: white background -> blurred shadow -> original image

  // 1. Create the shadow shape from the alpha channel
  const alphaChannel = await sharp(resultBuffer)
    .extractChannel('alpha')
    .toBuffer();

  // 2. Create shadow: take alpha, make it dark, extend, blur
  const shadow = await sharp(alphaChannel)
    .resize(width, height)
    .extend({
      top: padding,
      bottom: padding + shadowOffset,
      left: padding,
      right: padding + shadowOffset,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .blur(shadowBlur)
    .modulate({ brightness: 0 }) // Make it black
    .toBuffer();

  // 3. Create final composite
  const result = await sharp({
    create: {
      width: newWidth,
      height: newHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 },
    },
  })
    .composite([
      // Shadow layer (offset and blurred)
      {
        input: await sharp(shadow)
          .ensureAlpha()
          .modulate({ brightness: 0.3 })
          .toBuffer(),
        top: shadowOffset,
        left: shadowOffset,
        blend: 'multiply',
      },
      // Original image with transparent background
      {
        input: await sharp(resultBuffer)
          .extend({
            top: padding,
            bottom: padding + shadowOffset,
            left: padding,
            right: padding + shadowOffset,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .toBuffer(),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  return result;
}

async function uploadToStrapi(
  imageBuffer: Buffer,
  filename: string
): Promise<number | null> {
  try {
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('files', blob, filename);

    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      body: formData,
    });

    if (!response.ok) return null;

    const result = await response.json();
    return result?.[0]?.id || null;
  } catch {
    return null;
  }
}

async function updateProductImage(
  documentId: string,
  fileId: number
): Promise<boolean> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/products/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({ data: { images: [fileId] } }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function deleteOldFile(fileId: number): Promise<void> {
  try {
    await fetch(`${STRAPI_URL}/api/upload/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    });
  } catch {
    // Ignore errors
  }
}

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Image Background Removal & Shadow        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  if (!STRAPI_TOKEN) {
    console.error('❌ STRAPI_ADMIN_TOKEN is required');
    process.exit(1);
  }

  // Initialize background removal
  await initBackgroundRemoval();

  // Get products with images
  const products = await getProductsWithImages();

  if (products.length === 0) {
    console.log('No products with images found!');
    return;
  }

  console.log(`Processing ${products.length} product images...\n`);

  let processed = 0;
  let failed = 0;

  for (const product of products) {
    try {
      const image = product.images[0];
      const oldFileId = image.id;

      // Download
      const imageBuffer = await downloadImage(image.url);
      if (!imageBuffer) {
        console.log(`  ✗ ${product.name}: download failed`);
        failed++;
        continue;
      }

      // Process (remove bg + add shadow)
      const resultBuffer = await processImage(imageBuffer);

      // Generate new filename
      const baseName = path.basename(image.name, path.extname(image.name));
      const newFilename = `${baseName}_processed.png`;

      // Upload new image
      const newFileId = await uploadToStrapi(resultBuffer, newFilename);
      if (!newFileId) {
        console.log(`  ✗ ${product.name}: upload failed`);
        failed++;
        continue;
      }

      // Update product
      const success = await updateProductImage(product.documentId, newFileId);
      if (!success) {
        console.log(`  ✗ ${product.name}: link failed`);
        failed++;
        continue;
      }

      // Delete old file
      await deleteOldFile(oldFileId);

      processed++;
      console.log(`  ✓ [${processed}/${products.length}] ${product.name}`);

      // Progress update
      if (processed % 10 === 0) {
        console.log(`\n  Progress: ${processed}/${products.length} (${failed} failed)\n`);
      }

      await delay(100);
    } catch (error) {
      console.log(`  ✗ ${product.name}: ${error}`);
      failed++;
    }
  }

  console.log('\n════════════════════════════════════════════');
  console.log(`✅ Processed: ${processed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('════════════════════════════════════════════\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
