import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Enable gzip compression
  compress: true,

  // Optimize production builds
  productionBrowserSourceMaps: false,

  images: {
    // Enable optimization in production, disable in dev for faster rebuilds
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'csz.wedopixels.hu',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'csz.wedopixels.hu',
        pathname: '/**',
      },
    ],
  },

  // SEO Redirects: Legacy URLs to new URLs
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
