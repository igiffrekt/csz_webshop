import type { MetadataRoute } from 'next';
import { getProducts, getCategories, getBlogPosts } from '@/lib/sanity-queries';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://csz-tuzvedelmi.hu';

function getSlugString(slug: any): string {
  if (typeof slug === 'string') return slug;
  return slug?.current || '';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/hu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/hu/termekek`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/hu/kategoriak`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/hu/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/hu/rolunk`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/hu/kapcsolat`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/hu/gyik`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/hu/aszf`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/hu/adatvedelem`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/hu/visszaterites`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Fetch products for sitemap
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const { data: products } = await getProducts({ pageSize: 1000 });
    productPages = products.map((product: any) => ({
      url: `${SITE_URL}/hu/termekek/${getSlugString(product.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
  }

  // Fetch categories for sitemap
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const { data: categories } = await getCategories();
    categoryPages = categories.map((category: any) => ({
      url: `${SITE_URL}/hu/kategoriak/${getSlugString(category.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error);
  }

  // Fetch blog posts for sitemap
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { data: posts } = await getBlogPosts(1, 1000);
    blogPages = posts.map((post: any) => ({
      url: `${SITE_URL}/hu/blog/${getSlugString(post.slug)}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Failed to fetch blog posts for sitemap:', error);
  }

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages];
}
