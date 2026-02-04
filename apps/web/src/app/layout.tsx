import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Lufga font
const lufga = localFont({
  src: [
    {
      path: "../../public/fonts/Lufga-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lufga-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lufga-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lufga-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lufga-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lufga-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://csz-tuzvedelmi.hu';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CSZ Tűzvédelem - Tűzvédelmi eszközök és felszerelések',
    template: '%s | CSZ Tűzvédelem',
  },
  description: 'Professzionális tűzvédelmi eszközök és biztonsági felszerelések online boltja. Tűzoltó készülékek, tűzjelző rendszerek, védőfelszerelések gyors szállítással.',
  keywords: [
    'tűzvédelem',
    'tűzoltó készülék',
    'tűzjelző rendszer',
    'poroltó',
    'CO2 oltó',
    'haboltó',
    'tűzcsap szekrény',
    'tűzvédelmi felszerelés',
    'Budapest',
    'Magyarország',
  ],
  authors: [{ name: 'CSZ Tűzvédelmi Kft.' }],
  creator: 'CSZ Tűzvédelmi Kft.',
  publisher: 'CSZ Tűzvédelmi Kft.',
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'hu_HU',
    url: SITE_URL,
    siteName: 'CSZ Tűzvédelem',
    title: 'CSZ Tűzvédelem - Tűzvédelmi eszközök és felszerelések',
    description: 'Professzionális tűzvédelmi eszközök és biztonsági felszerelések online boltja.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CSZ Tűzvédelem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CSZ Tűzvédelem - Tűzvédelmi eszközök',
    description: 'Professzionális tűzvédelmi eszközök online boltja.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body
        className={`${lufga.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
