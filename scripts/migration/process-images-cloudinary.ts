/**
 * Process Product Images with Cloudinary
 *
 * This script:
 * 1. Fetches all product images from Strapi
 * 2. Uploads to Cloudinary with background removal
 * 3. Downloads the processed image
 * 4. Adds a soft drop shadow using Sharp
 * 5. Re-uploads to Strapi
 *
 * Usage:
 *   npx tsx scripts/migration/process-images-cloudinary.ts
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

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

// Cloudinary config
cloudinary.config({
  cloud_name: 'pixelkripta',
  api_key: '526256412348358',
  api_secret: 'Vsxr8E0YvZLdMuqQNjJgqMT_FXI',
});

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
    if (!response.ok) {
      console.log(`    Download failed: ${response.status} for ${fullUrl}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || '';

    // Check if it's JSON (error response) instead of image
    if (contentType.includes('application/json')) {
      const text = await response.text();
      console.log(`    Got JSON instead of image: ${text.substring(0, 100)}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Verify it's actually image data (check magic bytes)
    if (buffer.length < 8) {
      console.log(`    Buffer too small: ${buffer.length} bytes`);
      return null;
    }

    return buffer;
  } catch (error) {
    console.log(`    Download exception: ${error}`);
    return null;
  }
}

async function removeBackgroundWithCloudinary(imageBuffer: Buffer, productName: string): Promise<Buffer | null> {
  try {
    // Upload to Cloudinary with background removal transformation
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'csz_temp',
      transformation: [
        { effect: 'background_removal' },
        { format: 'png' }
      ],
    });

    // Download the processed image
    const processedUrl = result.secure_url;
    const response = await fetch(processedUrl);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const processedBuffer = Buffer.from(arrayBuffer);

    // Delete from Cloudinary (cleanup)
    await cloudinary.uploader.destroy(result.public_id);

    return processedBuffer;
  } catch (error) {
    console.error(`    Cloudinary error: ${error}`);
    return null;
  }
}

async function addShadow(imageBuffer: Buffer): Promise<Buffer> {
  // Shadow on transparent background, output as WebP
  const metadata = await sharp(imageBuffer).metadata();
  const { width = 800, height = 800 } = metadata;

  const padding = 40;
  const shadowOffset = 10;
  const shadowBlur = 12;
  const shadowOpacity = 0.3;

  // Ensure RGBA
  const rgbaImage = await sharp(imageBuffer)
    .ensureAlpha()
    .png()
    .toBuffer();

  // Final size with padding
  const finalWidth = width + padding * 2 + shadowOffset;
  const finalHeight = height + padding * 2 + shadowOffset;

  // Create shadow: black version with reduced opacity, blurred
  const shadow = await sharp(rgbaImage)
    .modulate({ brightness: 0 }) // Make black
    .linear(shadowOpacity, 0) // Reduce opacity
    .blur(shadowBlur)
    .toBuffer();

  // Create transparent background with shadow and image
  const result = await sharp({
    create: {
      width: finalWidth,
      height: finalHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent
    },
  })
    .composite([
      // Shadow layer (offset down-right)
      {
        input: shadow,
        top: padding + shadowOffset,
        left: padding + shadowOffset,
        blend: 'over',
      },
      // Original image
      {
        input: rgbaImage,
        top: padding,
        left: padding,
        blend: 'over',
      },
    ])
    .png({ compressionLevel: 9 }) // PNG with transparency
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

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`    Upload error: ${response.status} - ${errorText.substring(0, 200)}`);
      return null;
    }

    const result = await response.json();
    return result?.[0]?.id || null;
  } catch (err) {
    console.log(`    Upload exception: ${err}`);
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
    // Ignore
  }
}

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Cloudinary Background Removal + Shadow   ║');
  console.log('╚════════════════════════════════════════════╝\n');

  if (!STRAPI_TOKEN) {
    console.error('❌ STRAPI_ADMIN_TOKEN is required');
    process.exit(1);
  }

  // Get products with images
  const products = await getProductsWithImages();

  if (products.length === 0) {
    console.log('No products with images found!');
    return;
  }

  console.log(`Processing ${products.length} product images...\n`);
  console.log('Note: Each image uses ~0.1 Cloudinary credit\n');

  let processed = 0;
  let failed = 0;

  for (const product of products) {
    try {
      const image = product.images[0];
      const oldFileId = image.id;

      // Download from Strapi
      const imageBuffer = await downloadImage(image.url);
      if (!imageBuffer) {
        console.log(`  ✗ ${product.name}: download failed`);
        failed++;
        continue;
      }

      // Debug: check buffer
      console.log(`    Buffer: ${imageBuffer.length} bytes, magic: ${imageBuffer.slice(0, 4).toString('hex')}`);

      // Normalize with Sharp first
      let normalizedBuffer: Buffer;
      try {
        const metadata = await sharp(imageBuffer).metadata();
        console.log(`    Format: ${metadata.format} (${metadata.width}x${metadata.height})`);
        normalizedBuffer = await sharp(imageBuffer).png().toBuffer();
      } catch (sharpError) {
        console.log(`  ✗ ${product.name}: Sharp error - ${sharpError}`);
        failed++;
        continue;
      }

      // Remove background with Cloudinary
      console.log(`    Uploading to Cloudinary...`);
      let noBgBuffer: Buffer | null;
      try {
        noBgBuffer = await removeBackgroundWithCloudinary(normalizedBuffer, product.name);
      } catch (cloudErr) {
        console.log(`  ✗ ${product.name}: Cloudinary error - ${cloudErr}`);
        failed++;
        continue;
      }

      if (!noBgBuffer) {
        console.log(`  ✗ ${product.name}: background removal returned null`);
        failed++;
        continue;
      }

      // Debug: check Cloudinary output
      console.log(`    Cloudinary output: ${noBgBuffer.length} bytes, magic: ${noBgBuffer.slice(0, 4).toString('hex')}`);

      // Add shadow
      console.log(`    Adding shadow...`);
      let finalBuffer: Buffer;
      try {
        finalBuffer = await addShadow(noBgBuffer);
      } catch (shadowErr) {
        console.log(`  ✗ ${product.name}: Shadow error - ${shadowErr}`);
        failed++;
        continue;
      }

      // Generate new filename (PNG format with transparency)
      const baseName = path.basename(image.name, path.extname(image.name));
      const newFilename = `${baseName}_transparent.png`;

      // Upload to Strapi
      const newFileId = await uploadToStrapi(finalBuffer, newFilename);
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

      // Progress
      if (processed % 10 === 0) {
        console.log(`\n  Progress: ${processed}/${products.length} (${failed} failed)\n`);
      }

      // Rate limiting for Cloudinary
      await delay(500);
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
