import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getBlogPost } from '@/lib/sanity-queries';
import { PortableText } from '@portabletext/react';
import { ArrowLeft, Calendar, User } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: 'Cikk nem található | Dunamenti CSZ Kft.' };
  }

  return {
    title: post.seo?.metaTitle || `${post.title} | Dunamenti CSZ Kft.`,
    description: post.seo?.metaDescription || post.excerpt || '',
    openGraph: {
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author || 'Dunamenti CSZ'],
      ...(post.coverImage?.url ? { images: [{ url: post.coverImage.url }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: post.author || 'Dunamenti CSZ' },
    publisher: { '@type': 'Organization', name: 'Dunamenti CSZ Kft.' },
    ...(post.coverImage?.url ? { image: post.coverImage.url } : {}),
  }

  return (
    <main className="site-container py-6 sm:py-10 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6 sm:mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Vissza a bloghoz
      </Link>

      <article>
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            {formattedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
            )}
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author}
              </span>
            )}
          </div>
        </header>

        {/* Cover image */}
        {post.coverImage?.url && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl sm:rounded-2xl mb-6 sm:mb-10">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Body content */}
        {post.body && (
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#D4960A] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-[#FFBB36]">
            <PortableText value={post.body} />
          </div>
        )}
      </article>

      {/* Footer navigation */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-200 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Összes cikk
        </Link>
      </div>
    </main>
  );
}
