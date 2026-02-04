const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '9e09250230981f354d3791036c7e28450ecdb2a46432bc12b60f4a52504fabf3c14ea18edaf111d2152ff20769b8715e9890a9e7815a087a2728a163008af3d6d64660e5d52ef8b21db37d07618f550aaf8705dde242b7e9984d4c6d7def71e7ea876c421279c41157ca7c2447a442c64b5988ee20e32cdee1be7eb6f6878996';

async function main() {
  const res = await fetch(`${STRAPI_URL}/api/categories?pagination[pageSize]=100`, {
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
  });
  const data = await res.json();

  console.log(`Remaining categories (${data.data.length}):\n`);
  data.data.forEach((cat: { name: string; slug: string }) => console.log(`  - ${cat.name} (${cat.slug})`));
}

main().catch(console.error);
