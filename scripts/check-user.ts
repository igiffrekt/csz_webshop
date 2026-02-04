import fs from 'fs';
import path from 'path';

const envPath = path.join(__dirname, '../apps/web/.env.local');
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
  const email = 'stickerey@gmail.com';
  console.log('Looking for user:', email, '\n');

  // Check via users-permissions
  const url = STRAPI_URL + '/api/users?filters[email][$eq]=' + encodeURIComponent(email);
  const res = await fetch(url, {
    headers: { Authorization: 'Bearer ' + STRAPI_TOKEN }
  });

  if (!res.ok) {
    console.log('API Error:', res.status);
    const text = await res.text();
    console.log(text);
    return;
  }

  const users = await res.json();
  console.log('Users found:', JSON.stringify(users, null, 2));
}

main().catch(console.error);
