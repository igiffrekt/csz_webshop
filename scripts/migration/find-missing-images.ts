/**
 * Find products without working images
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

async function main() {
  console.log('Finding products with missing/broken images...\n');

  // Get all products with pagination
  const products: any[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `${STRAPI_URL}/api/products?populate=images&pagination[page]=${page}&pagination[pageSize]=100`,
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
  
  const noImages: string[] = [];
  const brokenImages: { name: string; url: string }[] = [];
  const workingImages: string[] = [];
  
  for (const product of products) {
    if (!product.images || product.images.length === 0) {
      noImages.push(product.name);
      continue;
    }
    
    const image = product.images[0];
    const fullUrl = image.url.startsWith('/') 
      ? `${STRAPI_URL}${image.url}` 
      : image.url;
    
    try {
      const imgRes = await fetch(fullUrl, { method: 'HEAD' });
      if (imgRes.ok) {
        workingImages.push(product.name);
      } else {
        brokenImages.push({ name: product.name, url: image.url });
      }
    } catch {
      brokenImages.push({ name: product.name, url: image.url });
    }
  }
  
  console.log(`✅ Working images: ${workingImages.length}`);
  console.log(`❌ No images: ${noImages.length}`);
  console.log(`⚠️ Broken images: ${brokenImages.length}`);
  
  if (noImages.length > 0) {
    console.log('\n--- Products WITHOUT images ---');
    noImages.forEach(n => console.log(`  - ${n}`));
  }
  
  if (brokenImages.length > 0) {
    console.log('\n--- Products with BROKEN image links ---');
    brokenImages.forEach(b => console.log(`  - ${b.name} (${b.url})`));
  }
}

main().catch(console.error);
