import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getBlogPosts } from '@/lib/sanity-queries';
import { ArrowRight, ArrowLeft, Calendar, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | Dunamenti CSZ Kft.',
  description: 'Tippek, hírek és útmutatók a tűzvédelmi termékek és megoldások világából.',
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const { data: posts, meta } = await getBlogPosts(currentPage, 9);
  const { pagination } = meta;

  return (
    <main className="site-container py-10">
      {/* Page header */}
      <div className="mb-10">
        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
          Blog
        </span>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
          Legfrissebb cikkeink
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Tippek, hírek és útmutatók a tűzvédelmi termékek és megoldások világából.
        </p>
      </div>

      {/* Blog grid */}
      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">Még nincsenek blog bejegyzések.</p>
          <p className="mt-2">Hamarosan érkeznek a cikkek!</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pageCount > 1 && (
        <nav className="flex items-center justify-center gap-4 mt-12">
          {currentPage > 1 && (
            <Link
              href={`/blog?page=${currentPage - 1}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Előző
            </Link>
          )}

          <span className="text-sm text-gray-500">
            {currentPage} / {pagination.pageCount} oldal
          </span>

          {currentPage < pagination.pageCount && (
            <Link
              href={`/blog?page=${currentPage + 1}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Következő
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}

function BlogCard({ post }: { post: any }) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <article className="bg-transparent overflow-visible transition-all duration-300 group">
      <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden rounded-[20px]">
        {post.coverImage?.url ? (
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#f6f6f6]">
            <span className="text-5xl">📰</span>
          </div>
        )}

        {formattedDate && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-white text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full">
              {formattedDate}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </Link>

      <div className="pt-4">
        <Link href={`/blog/${post.slug}`}>
          <h2 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-[#D4960A] transition-colors">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          {post.author && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
          )}
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-[#D4960A] font-medium text-sm mt-3 hover:gap-3 transition-all duration-200"
        >
          Tovább olvasom
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
