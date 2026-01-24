import type { MetadataRoute } from 'next';
import { getStrapiProducts, getStrapiCategories } from '@/lib/strapi';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://csz-tuzvedelmi.hu';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/termekek`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/kategoriak`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/rolunk`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/kapcsolat`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/gyik`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/aszf`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/adatvedelem`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/visszaterites`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Fetch products for sitemap
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const { products } = await getStrapiProducts({ pageSize: 1000 });
    productPages = products.map((product) => ({
      url: `${SITE_URL}/termekek/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
  }

  // Fetch categories for sitemap
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getStrapiCategories();
    categoryPages = categories.map((category) => ({
      url: `${SITE_URL}/kategoriak/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error);
  }

  return [...staticPages, ...productPages, ...categoryPages];
}
