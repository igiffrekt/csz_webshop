import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Calendar, ArrowRight, User } from 'lucide-react';

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  image?: string;
  author?: string;
}

// Placeholder posts until blog is implemented
const placeholderPosts: BlogPost[] = [
  {
    title: 'Tűzoltó készülék karbantartás: Mikor és hogyan?',
    excerpt: 'A tűzoltó készülékek rendszeres karbantartása kötelező és életmentő. Tudja meg, milyen gyakorisággal kell ellenőriztetni készülékeit.',
    date: '2026-01-15',
    slug: 'tuzolto-keszulek-karbantartas',
    author: 'CSZ Szakértő',
  },
  {
    title: 'Tűzvédelmi szabályzat változások 2026-ban',
    excerpt: 'Az új év új szabályokat hoz a tűzvédelem területén. Összefoglaljuk a legfontosabb változásokat, amikre figyelnie kell.',
    date: '2026-01-10',
    slug: 'tuzvedelmi-szabalyzat-2026',
    author: 'CSZ Szakértő',
  },
  {
    title: 'Hogyan válasszunk tűzjelző rendszert?',
    excerpt: 'A megfelelő tűzjelző rendszer kiválasztása kulcsfontosságú a biztonság szempontjából. Segítünk a döntésben.',
    date: '2026-01-05',
    slug: 'tuzjelzo-valasztas',
    author: 'CSZ Szakértő',
  },
];

interface BlogSectionProps {
  posts?: BlogPost[];
}

export function BlogSection({ posts = placeholderPosts }: BlogSectionProps) {
  return (
    <section className="py-16 lg:py-20 bg-secondary-50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span className="text-primary-500 font-medium text-sm uppercase tracking-wider">
              Hírek és Blog
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mt-2">
              Legfrissebb cikkeink
            </h2>
            <p className="text-secondary-600 mt-2">
              Tippek, hírek és útmutatók a tűzvédelem világából
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-secondary-900 text-secondary-900 font-medium rounded-full hover:bg-secondary-900 hover:text-white transition-colors"
          >
            Összes cikk
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Blog grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      {/* Image */}
      <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300">
            <span className="text-5xl">📰</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-secondary-900/0 group-hover:bg-secondary-900/10 transition-colors duration-300" />
      </Link>

      {/* Content */}
      <div className="p-6">
        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-secondary-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-bold text-secondary-900 text-lg leading-tight line-clamp-2 group-hover:text-primary-500 transition-colors">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-secondary-600 text-sm mt-3 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Read more link */}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-primary-500 font-medium text-sm mt-4 hover:gap-3 transition-all duration-200"
        >
          Tovább olvasom
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
