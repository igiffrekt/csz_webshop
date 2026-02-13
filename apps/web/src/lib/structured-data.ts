import type { Product } from '@csz/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://csz-tuzvedelmi.hu';

export function generateProductJsonLd(product: Product) {
  const image = product.images?.[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.shortDescription,
    image: image ? `${SITE_URL}${image.url}` : undefined,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Dunamenti CSZ Kft.',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/termekek/${product.slug}`,
      priceCurrency: 'HUF',
      price: product.basePrice,
      availability: product.stock && product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Dunamenti CSZ Kft.',
      },
    },
    ...(product.certifications?.length && {
      additionalProperty: product.certifications.map((cert) => ({
        '@type': 'PropertyValue',
        name: 'Tanúsítvány',
        value: cert.name,
      })),
    }),
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dunamenti CSZ Kft.',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+36-1-234-5678',
      contactType: 'customer service',
      availableLanguage: 'Hungarian',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Példa utca 123.',
      addressLocality: 'Budapest',
      postalCode: '1234',
      addressCountry: 'HU',
    },
  };
}

export function generateFAQJsonLd(
  faqs: { question: string; answer: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.replace(/<[^>]*>/g, ''), // Strip HTML
      },
    })),
  };
}
