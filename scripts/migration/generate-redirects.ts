/**
 * URL Redirect Generation Script
 *
 * Generates redirect mappings from old WooCommerce URLs to new Next.js URLs.
 * Outputs both JSON file and console output for next.config.ts
 *
 * Usage:
 *   npx tsx scripts/migration/generate-redirects.ts [data/old-urls.csv]
 */

import fs from 'fs';

interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}

// Common WooCommerce URL patterns mapped to new URLs
const urlMappings: Record<string, string> = {
  // Product URLs (various WooCommerce patterns)
  '/product/': '/termekek/',
  '/termek/': '/termekek/',

  // Category URLs
  '/product-category/': '/kategoriak/',
  '/termek-kategoria/': '/kategoriak/',

  // Shop/Store pages
  '/shop': '/termekek',
  '/bolt': '/termekek',
  '/aruhaz': '/termekek',

  // Cart/Checkout
  '/cart': '/penztar',
  '/kosar': '/penztar',
  '/checkout': '/penztar',

  // Account pages
  '/my-account': '/fiok',
  '/fiokom': '/fiok',

  // Static pages (adjust based on actual old URLs)
  '/rolunk-2': '/rolunk',
  '/kapcsolat-2': '/kapcsolat',
  '/gyik-2': '/gyik',
  '/aszf-2': '/aszf',
  '/adatvedelem-2': '/adatvedelem',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateRedirectsFromUrls(oldUrls: string[]): Redirect[] {
  const redirects: Redirect[] = [];

  for (const oldUrl of oldUrls) {
    if (!oldUrl.trim()) continue;

    // Extract path from full URL if needed
    let path = oldUrl;
    try {
      const url = new URL(oldUrl);
      path = url.pathname;
    } catch {
      // Already a path, not a full URL
    }

    let newPath = path;

    // Apply URL pattern mappings
    for (const [oldPattern, newPattern] of Object.entries(urlMappings)) {
      if (path.includes(oldPattern)) {
        newPath = path.replace(oldPattern, newPattern);
        break;
      }
    }

    // Clean up URL (remove trailing slashes, query strings)
    newPath = newPath.replace(/\/+$/, '').split('?')[0];

    if (path !== newPath && newPath !== '') {
      redirects.push({
        source: path,
        destination: newPath,
        permanent: true,
      });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return redirects.filter((r) => {
    const key = r.source;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function generatePatternRedirects(): Redirect[] {
  return [
    // Product URL patterns
    {
      source: '/product/:slug',
      destination: '/termekek/:slug',
      permanent: true,
    },
    {
      source: '/termek/:slug',
      destination: '/termekek/:slug',
      permanent: true,
    },
    {
      source: '/product/:slug/',
      destination: '/termekek/:slug',
      permanent: true,
    },

    // Category URL patterns
    {
      source: '/product-category/:slug',
      destination: '/kategoriak/:slug',
      permanent: true,
    },
    {
      source: '/termek-kategoria/:slug',
      destination: '/kategoriak/:slug',
      permanent: true,
    },
    {
      source: '/product-category/:slug/:subslug',
      destination: '/kategoriak/:subslug',
      permanent: true,
    },

    // Shop pages
    {
      source: '/shop',
      destination: '/termekek',
      permanent: true,
    },
    {
      source: '/bolt',
      destination: '/termekek',
      permanent: true,
    },

    // Cart
    {
      source: '/cart',
      destination: '/penztar',
      permanent: true,
    },
    {
      source: '/kosar',
      destination: '/penztar',
      permanent: true,
    },

    // Checkout
    {
      source: '/checkout',
      destination: '/penztar',
      permanent: true,
    },

    // Account pages with wildcards
    {
      source: '/my-account/:path*',
      destination: '/fiok/:path*',
      permanent: true,
    },
    {
      source: '/fiokom/:path*',
      destination: '/fiok/:path*',
      permanent: true,
    },

    // Order received -> Success page
    {
      source: '/checkout/order-received/:id',
      destination: '/penztar/siker',
      permanent: true,
    },
  ];
}

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   URL Redirect Generation Tool             ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Load old URLs if available
  const urlsPath = process.argv[2] || 'data/old-urls.csv';
  let oldUrls: string[] = [];

  if (fs.existsSync(urlsPath)) {
    const content = fs.readFileSync(urlsPath, 'utf-8');
    oldUrls = content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    console.log(`✓ Loaded ${oldUrls.length} URLs from ${urlsPath}\n`);
  } else {
    console.log(`⚠ No URL file found at ${urlsPath}`);
    console.log('  Using pattern-based redirects only\n');
  }

  // Generate redirects
  const patternRedirects = generatePatternRedirects();
  const specificRedirects = generateRedirectsFromUrls(oldUrls);

  // Combine (patterns first, then specific)
  const allRedirects = [...patternRedirects, ...specificRedirects];

  console.log(`Generated ${patternRedirects.length} pattern redirects`);
  console.log(`Generated ${specificRedirects.length} specific redirects`);
  console.log(`Total: ${allRedirects.length} redirects\n`);

  // Output to JSON file
  const outputDir = 'apps/web';
  const outputPath = `${outputDir}/redirects.json`;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(allRedirects, null, 2));
  console.log(`✓ Saved to ${outputPath}\n`);

  // Output for next.config.ts
  console.log('════════════════════════════════════════════');
  console.log('Add to next.config.ts:');
  console.log('════════════════════════════════════════════\n');

  console.log('async redirects() {');
  console.log('  return [');
  patternRedirects.forEach((r) => {
    console.log(
      `    { source: '${r.source}', destination: '${r.destination}', permanent: ${r.permanent} },`
    );
  });
  console.log('  ];');
  console.log('}');
  console.log('');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
