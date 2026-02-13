import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dunamenti CSZ Kft. - Tűzvédelmi eszközök',
    short_name: 'Dunamenti CSZ Kft.',
    description: 'Professzionális tűzvédelmi eszközök és biztonsági felszerelések online boltja.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#FFBB36',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['shopping', 'business'],
    lang: 'hu',
  };
}
