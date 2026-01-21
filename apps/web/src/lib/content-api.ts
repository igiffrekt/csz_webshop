const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export interface SEO {
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: {
    url: string;
  };
  keywords?: string;
}

export interface Page {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content?: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface FAQ {
  id: number;
  documentId: string;
  question: string;
  answer: string;
  order: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate': 'seo.metaImage',
    });

    const response = await fetch(`${STRAPI_URL}/api/pages?${params}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const json = await response.json();
    return json.data?.[0] || null;
  } catch {
    return null;
  }
}

export async function getFAQs(): Promise<FAQ[]> {
  try {
    const params = new URLSearchParams({
      'sort': 'order:asc',
      'pagination[limit]': '100',
    });

    const response = await fetch(`${STRAPI_URL}/api/faqs?${params}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) return [];

    const json = await response.json();
    return json.data || [];
  } catch {
    return [];
  }
}
