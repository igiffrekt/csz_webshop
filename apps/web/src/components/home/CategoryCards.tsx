'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ChevronRight, ArrowRight } from 'lucide-react';
import type { Product } from '@csz/types';
import { getImageUrl, getSlugString } from '@/lib/formatters';

interface CategoryChild {
  name: string;
  slug: string;
  count?: number;
}

interface CategoryCardData {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  image?: string | null;
  children: CategoryChild[];
}

interface CategoryCardsProps {
  categories: {
    _id?: string;
    name: string;
    slug: string;
    count?: number;
    image?: { url: string } | null;
    children?: { name: string; slug: string; count?: number }[];
  }[];
  products?: Product[];
  sectionTitle?: string;
  sectionSubtitle?: string;
}

const categoryConfig: string[][] = [
  ['tuzcsapszekrenyek', 'tuzcsap-szekrenyek'],
  ['tuzolto-szerelvenyek'],
  ['tuzcsapok'],
  ['tuzolto-keszulekek'],
  ['tomlok', 'tomlo', 'tuztomlo', 'tuz-tomlo', 'tuzolto-tomlo'],
  ['passziv-tuzvedelme', 'passziv-tuzvedelmi-termekek'],
];

// Accent colors per card position
const accents = [
  { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600' },
  { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-600' },
  { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
  { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
  { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-600' },
];

function findProductImageForCategory(
  categorySlug: string,
  products: Product[]
): string | null {
  const product = products.find((p) =>
    p.categories?.some((cat) => {
      const s = getSlugString(cat.slug);
      return s === categorySlug || s.includes(categorySlug) || categorySlug.includes(s);
    })
  );
  if (!product) return null;
  if (product.images?.[0]?.url) return getImageUrl(product.images[0].url);
  return null;
}

export function CategoryCards({ categories, products = [], sectionTitle, sectionSubtitle }: CategoryCardsProps) {
  const tomloChildren: CategoryChild[] = [];
  let tomloProductCount = 0;
  let tomloImage: string | null = null;

  categories.forEach((cat) => {
    if (!cat.name || !cat.slug) return;
    if (cat.name.toLowerCase().includes('tömlő') || cat.slug.includes('tomlo')) {
      tomloChildren.push({ name: cat.name, slug: cat.slug, count: cat.count || 0 });
      tomloProductCount += cat.count || 0;
      if (!tomloImage && cat.image?.url) tomloImage = cat.image.url;
    }
    cat.children?.forEach((child) => {
      if (!child.name || !child.slug) return;
      if (child.name.toLowerCase().includes('tömlő') || child.slug.includes('tomlo')) {
        tomloChildren.push({ name: child.name, slug: child.slug, count: child.count || 0 });
        tomloProductCount += child.count || 0;
      }
    });
  });

  const displayCategories = useMemo(() => {
    return categoryConfig
      .map((slugs): CategoryCardData | null => {
        if (slugs.includes('tomlok')) {
          if (tomloChildren.length === 0) return null;
          let image = tomloImage;
          if (!image) {
            for (const child of tomloChildren) {
              const productImage = findProductImageForCategory(child.slug, products);
              if (productImage) { image = productImage; break; }
            }
          }
          return {
            id: 'tomlok', name: 'Tömlők', slug: 'tomlok',
            productCount: tomloProductCount, image, children: [...tomloChildren],
          };
        }

        const matchedCat = categories.find((cat) =>
          cat.slug && slugs.some((slug) => cat.slug.includes(slug) || slug.includes(cat.slug))
        );
        if (!matchedCat) return null;

        const children = matchedCat.children?.map(child => ({
          name: child.name, slug: child.slug, count: child.count || 0,
        })) || [];

        const totalProductCount = (matchedCat.count || 0) +
          children.reduce((sum, child) => sum + (child.count || 0), 0);

        let image = matchedCat.image?.url || null;
        if (!image) {
          image = findProductImageForCategory(matchedCat.slug, products);
          if (!image && children.length > 0) {
            for (const child of children) {
              const productImage = findProductImageForCategory(child.slug, products);
              if (productImage) { image = productImage; break; }
            }
          }
        }

        return {
          id: matchedCat._id || matchedCat.slug, name: matchedCat.name,
          slug: matchedCat.slug, productCount: totalProductCount, image,
          children,
        };
      })
      .filter((cat): cat is CategoryCardData => cat !== null);
  }, [categories, products, tomloChildren, tomloProductCount, tomloImage]);

  if (displayCategories.length === 0) return null;

  return (
    <section className="py-12 lg:py-20">
      <div className="site-container">
        {/* Section header */}
        <div className="text-center mb-10 lg:mb-14">
          <span className="text-amber-500 text-sm font-semibold uppercase tracking-wider">
            {sectionSubtitle || 'Kategóriák'}
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
            {sectionTitle || 'Termékkategóriák'}
          </h2>
        </div>

        {/* Row 1: one wide card + one narrow card */}
        <div className="flex flex-col lg:flex-row gap-5 mb-5">
          <div className="lg:flex-[2]">
            <CategoryCard category={displayCategories[0]} accent={accents[0]} variant="wide" />
          </div>
          {displayCategories[1] && (
            <div className="lg:flex-[1]">
              <CategoryCard category={displayCategories[1]} accent={accents[1]} variant="tall" />
            </div>
          )}
        </div>

        {/* Row 2: three equal cards */}
        {displayCategories.length > 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {displayCategories.slice(2, 5).map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} accent={accents[i + 2]} variant="compact" />
            ))}
          </div>
        )}

        {/* Row 3: remaining card as full-width banner */}
        {displayCategories[5] && (
          <CategoryCard category={displayCategories[5]} accent={accents[5]} variant="banner" />
        )}
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  accent,
  variant,
}: {
  category: CategoryCardData;
  accent: (typeof accents)[number];
  variant: 'wide' | 'tall' | 'compact' | 'banner';
}) {
  const hasImage = !!category.image;

  if (variant === 'wide') {
    return (
      <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <div className={`absolute top-0 left-0 right-0 h-1 ${accent.bg}`} />
        <div className="flex flex-col sm:flex-row h-full">
          <div className="flex flex-col p-6 lg:p-8 sm:flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-4">
              <Link href={`/kategoriak/${category.slug}`}>
                <h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-amber-500 transition-colors">
                  {category.name}
                </h3>
              </Link>
              {(
                <span className={`flex-shrink-0 inline-flex items-center ${accent.light} ${accent.text} rounded-full px-3 py-1 text-xs font-bold`}>
                  {category.productCount}
                </span>
              )}
            </div>
            <SubcategoryList items={category.children} slug={category.slug} />
            <div className="mt-auto pt-4">
              <Link
                href={`/kategoriak/${category.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors"
              >
                Összes termék <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
          {hasImage && (
            <Link href={`/kategoriak/${category.slug}`} className="relative sm:w-[240px] h-[180px] sm:h-auto flex-shrink-0 bg-gray-50/50">
              <Image src={category.image!} alt={category.name} fill className="object-contain p-6 transition-transform duration-500 group-hover:scale-105" sizes="240px" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'tall') {
    return (
      <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <div className={`absolute top-0 left-0 right-0 h-1 ${accent.bg}`} />
        {hasImage && (
          <Link href={`/kategoriak/${category.slug}`} className="relative h-[160px] flex-shrink-0 bg-gray-50/50">
            <Image src={category.image!} alt={category.name} fill className="object-contain p-5 transition-transform duration-500 group-hover:scale-105" sizes="400px" />
          </Link>
        )}
        <div className="flex flex-col flex-1 p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <Link href={`/kategoriak/${category.slug}`}>
              <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-amber-500 transition-colors">
                {category.name}
              </h3>
            </Link>
            {(
              <span className={`flex-shrink-0 inline-flex items-center ${accent.light} ${accent.text} rounded-full px-3 py-1 text-xs font-bold`}>
                {category.productCount}
              </span>
            )}
          </div>
          <SubcategoryList items={category.children} slug={category.slug} />
          <div className="mt-auto pt-4">
            <Link
              href={`/kategoriak/${category.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors"
            >
              Összes termék <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className={`absolute top-0 left-0 right-0 h-1 ${accent.bg}`} />
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col p-6 lg:p-8 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-4">
              <Link href={`/kategoriak/${category.slug}`}>
                <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-amber-500 transition-colors">
                  {category.name}
                </h3>
              </Link>
              {(
                <span className={`flex-shrink-0 inline-flex items-center ${accent.light} ${accent.text} rounded-full px-3 py-1 text-xs font-bold`}>
                  {category.productCount}
                </span>
              )}
            </div>
            {category.children.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1">
                {category.children.map((child, idx) => (
                  <Link
                    key={idx}
                    href={`/kategoriak/${child.slug}`}
                    className="group/link flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-500 transition-colors py-0.5"
                  >
                    <ChevronRight className="h-3 w-3 text-gray-300 group-hover/link:text-amber-400 transition-colors flex-shrink-0" />
                    <span className="truncate">{child.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href={`/kategoriak/${category.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors"
              >
                Termékek megtekintése <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          {hasImage && (
            <Link href={`/kategoriak/${category.slug}`} className="relative sm:w-[200px] h-[140px] sm:h-auto flex-shrink-0 bg-gray-50/50">
              <Image src={category.image!} alt={category.name} fill className="object-contain p-5 transition-transform duration-500 group-hover:scale-105" sizes="200px" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // compact
  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <div className={`absolute top-0 left-0 right-0 h-1 ${accent.bg}`} />
      <div className="flex flex-col flex-1 p-5 lg:p-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link href={`/kategoriak/${category.slug}`}>
            <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-amber-500 transition-colors">
              {category.name}
            </h3>
          </Link>
          {(
            <span className={`flex-shrink-0 inline-flex items-center ${accent.light} ${accent.text} rounded-full px-2.5 py-0.5 text-xs font-bold`}>
              {category.productCount}
            </span>
          )}
        </div>
        {category.children.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {category.children.map((child, idx) => (
              <Link
                key={idx}
                href={`/kategoriak/${child.slug}`}
                className="group/link flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-500 transition-colors py-0.5"
              >
                <ChevronRight className="h-3 w-3 text-gray-300 group-hover/link:text-amber-400 transition-colors flex-shrink-0" />
                <span className="truncate">{child.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <Link
            href={`/kategoriak/${category.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors"
          >
            Termékek megtekintése <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        {hasImage && (
          <Link href={`/kategoriak/${category.slug}`} className="relative h-[120px] mt-auto pt-3 flex-shrink-0">
            <Image src={category.image!} alt={category.name} fill className="object-contain object-center transition-transform duration-500 group-hover:scale-105" sizes="300px" />
          </Link>
        )}
      </div>
    </div>
  );
}

function SubcategoryList({ items, slug }: { items: CategoryChild[]; slug: string }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((child, idx) => (
        <Link
          key={idx}
          href={`/kategoriak/${child.slug}`}
          className="group/link flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-500 transition-colors py-0.5"
        >
          <ChevronRight className="h-3 w-3 text-gray-300 group-hover/link:text-amber-400 transition-colors flex-shrink-0" />
          <span className="truncate">{child.name}</span>
        </Link>
      ))}
    </div>
  );
}
