import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@csz/types';
import { getStrapiMediaUrl } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const t = useTranslations('home.categories');

  // Filter to top-level categories only (those without parent)
  const topLevelCategories = categories.filter((cat) => !cat.parent);

  // Use fallback categories if none from API
  const displayCategories = topLevelCategories.length > 0
    ? topLevelCategories.slice(0, 6)
    : defaultCategories;

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-primary-500 font-medium text-sm uppercase tracking-wider">
            Kategóriák
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mt-2">
            {t('title')}
          </h2>
          <p className="text-secondary-600 mt-3 max-w-2xl mx-auto">
            Fedezze fel tűzvédelmi termékkínálatunkat kategóriák szerint
          </p>
        </div>

        {/* Category grid - responsive layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {displayCategories.map((category, index) => (
            <CategoryCard
              key={category.documentId || category.slug}
              category={category}
              featured={index < 2}
            />
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-10">
          <Link
            href="/kategoriak"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-100 text-secondary-900 font-medium rounded-full hover:bg-secondary-200 transition-colors"
          >
            Összes kategória megtekintése
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

interface CategoryCardProps {
  category: Category;
  featured?: boolean;
}

function CategoryCard({ category, featured = false }: CategoryCardProps) {
  const imageUrl = category.image
    ? getStrapiMediaUrl(category.image.url)
    : null;
  const imageAlt = category.image?.alternativeText || category.name;
  const subcategoryCount = category.children?.length || 0;

  return (
    <Link
      href={`/kategoriak/${category.slug}`}
      className={cn(
        'group relative block overflow-hidden rounded-2xl',
        'transition-all duration-300 hover:shadow-xl',
        featured ? 'md:row-span-2 aspect-[4/5] md:aspect-auto' : 'aspect-[4/3]'
      )}
    >
      {/* Background image or gradient */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-400" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/90 via-secondary-900/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-end">
        <h3 className="text-lg lg:text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
          {category.name}
        </h3>
        {subcategoryCount > 0 && (
          <p className="text-white/70 text-sm mt-1">
            {subcategoryCount} alkategória
          </p>
        )}
        {category.description && featured && (
          <p className="text-white/60 text-sm mt-2 line-clamp-2 hidden md:block">
            {category.description}
          </p>
        )}
      </div>

      {/* Hover indicator */}
      <div className="absolute top-4 right-4 w-9 h-9 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <ArrowRight className="h-4 w-4 text-white" />
      </div>
    </Link>
  );
}

// Default categories if none from API
const defaultCategories = [
  { documentId: '1', name: 'Tűzoltó készülékek', slug: 'tuzolto-keszulekek', children: [] },
  { documentId: '2', name: 'Tűzjelző rendszerek', slug: 'tuzjelzo-rendszerek', children: [] },
  { documentId: '3', name: 'Poroltó készülékek', slug: 'porolto-keszulekek', children: [] },
  { documentId: '4', name: 'CO2 oltók', slug: 'co2-oltok', children: [] },
  { documentId: '5', name: 'Haboltó készülékek', slug: 'habolto-keszulekek', children: [] },
  { documentId: '6', name: 'Kiegészítők', slug: 'kiegeszitok', children: [] },
] as unknown as Category[];
