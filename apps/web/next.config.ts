import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    // Disable optimization in dev - Strapi localhost images cause 400 errors
    // Production will use proper CDN/domain configuration
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '1337',
        pathname: '/**',
      },
    ],
  },

  // SEO Redirects: WooCommerce URLs to new URLs
  async redirects() {
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
  },
};

export default withNextIntl(nextConfig);
