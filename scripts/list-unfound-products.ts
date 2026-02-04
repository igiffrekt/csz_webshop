/**
 * List Strapi products that don't exist in WooCommerce
 */

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '9e09250230981f354d3791036c7e28450ecdb2a46432bc12b60f4a52504fabf3c14ea18edaf111d2152ff20769b8715e9890a9e7815a087a2728a163008af3d6d64660e5d52ef8b21db37d07618f550aaf8705dde242b7e9984d4c6d7def71e7ea876c421279c41157ca7c2447a442c64b5988ee20e32cdee1be7eb6f6878996';

const WOOCOMMERCE_URL = 'https://csz.wedopixels.hu';
const CONSUMER_KEY = 'ck_42b6c2c98110fef1fdc8b6ddc0bb4705bb927499';
const CONSUMER_SECRET = 'cs_f679a2af5daee40e595485924749f4daeec9fd0f';

interface WooProduct {
  id: number;
  sku: string;
}

interface StrapiProduct {
  id: number;
  name: string;
  sku: string;
  basePrice: number;
}

async function main() {
  // Fetch WooCommerce SKUs
  console.log('Fetching WooCommerce products...');
  const wooSkus = new Set<string>();
  let page = 1;

  while (true) {
    const url = `${WOOCOMMERCE_URL}/wp-json/wc/v3/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&per_page=100&page=${page}`;
    const res = await fetch(url);
    const products: WooProduct[] = await res.json();

    for (const p of products) {
      if (p.sku) wooSkus.add(p.sku);
    }

    console.log(`  Page ${page}: ${products.length} products`);
    if (products.length < 100) break;
    page++;
  }

  // Fetch Strapi products
  console.log('\nFetching Strapi products...');
  const strapiProducts: StrapiProduct[] = [];
  page = 1;

  while (true) {
    const url = `${STRAPI_URL}/api/products?pagination[page]=${page}&pagination[pageSize]=100&fields[0]=name&fields[1]=sku&fields[2]=basePrice`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });
    const data = await res.json();
    strapiProducts.push(...data.data);

    console.log(`  Page ${page}: ${data.data.length} products`);
    if (data.data.length < 100) break;
    page++;
  }

  // Find products not in WooCommerce
  const notFound = strapiProducts.filter(p => !wooSkus.has(p.sku));

  console.log(`\n=== Products NOT found in WooCommerce (${notFound.length}) ===\n`);

  for (let i = 0; i < notFound.length; i++) {
    const p = notFound[i];
    const priceStr = p.basePrice.toLocaleString('hu-HU');
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   SKU: ${p.sku}`);
    console.log(`   Price: ${priceStr} Ft`);
    console.log('');
  }
}

main().catch(console.error);
