import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  image?: string;
}

// Placeholder posts until blog is implemented
const placeholderPosts: BlogPost[] = [
  {
    title: 'Tűzoltó készülék karbantartás: Mikor és hogyan?',
    excerpt: 'A tűzoltó készülékek rendszeres karbantartása kötelező és életmentő. Tudja meg, milyen gyakorisággal kell ellenőriztetni készülékeit.',
    date: '2026-01-15',
    slug: 'tuzolto-keszulek-karbantartas',
  },
  {
    title: 'Tűzvédelmi szabályzat változások 2026-ban',
    excerpt: 'Az új év új szabályokat hoz a tűzvédelem területén. Összefoglaljuk a legfontosabb változásokat, amikre figyelnie kell.',
    date: '2026-01-10',
    slug: 'tuzvedelmi-szabalyzat-2026',
  },
  {
    title: 'Hogyan válasszunk tűzjelző rendszert?',
    excerpt: 'A megfelelő tűzjelző rendszer kiválasztása kulcsfontosságú a biztonság szempontjából. Segítünk a döntésben.',
    date: '2026-01-05',
    slug: 'tuzjelzo-valasztas',
  },
];

interface BlogSectionProps {
  posts?: BlogPost[];
}

export function BlogSection({ posts = placeholderPosts }: BlogSectionProps) {
  return (
    <section className="py-10 lg:py-20 bg-white">
      <div className="site-container">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              Blog
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Legfrissebb cikkeink
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Tippek, hírek és útmutatók a tűzvédelmi termékek világából
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 border border-gray-200 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-colors"
          >
            Összes cikk
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Blog grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.date).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="bg-transparent overflow-visible transition-all duration-300 group">
      {/* Image with date badge */}
      <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden rounded-[20px]">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#f6f6f6]">
            <span className="text-5xl">📰</span>
          </div>
        )}

        {/* Date badge at bottom-left */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full">
            {formattedDate}
          </span>
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </Link>

      {/* Content */}
      <div className="pt-4">
        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-[#D4960A] transition-colors">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Read more link */}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-[#D4960A] font-medium text-sm mt-3 py-1 hover:gap-3 transition-all duration-200"
        >
          Tovább olvasom
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
