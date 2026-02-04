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
  const res = await fetch(
    `${STRAPI_URL}/api/products?pagination[pageSize]=1`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
  );
  const data = await res.json();
  console.log('Total products in Strapi:', data.meta?.pagination?.total || 'unknown');
}

main().catch(console.error);
