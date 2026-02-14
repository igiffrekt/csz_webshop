'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';
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

const MAX_CHILDREN = 4;

export function CategoryCards({ categories, products = [], sectionTitle, sectionSubtitle }: CategoryCardsProps) {
  // Collect tömlő-related categories
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
            id: 'tomlok',
            name: 'Tömlők',
            slug: 'tomlok',
            productCount: tomloProductCount,
            image,
            children: tomloChildren.slice(0, 10),
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
          id: matchedCat._id || matchedCat.slug,
          name: matchedCat.name,
          slug: matchedCat.slug,
          productCount: totalProductCount,
          image,
          children: children.slice(0, 10),
        };
      })
      .filter((cat): cat is CategoryCardData => cat !== null);
  }, [categories, products, tomloChildren, tomloProductCount, tomloImage]);

  if (displayCategories.length === 0) return null;

  return (
    <section className="py-12 lg:py-20 bg-gray-50/60">
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

        {/* Uniform 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {displayCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category }: { category: CategoryCardData }) {
  const visibleChildren = category.children.slice(0, MAX_CHILDREN);
  const remainingCount = Math.max(0, category.children.length - MAX_CHILDREN);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
      {/* Top: image area */}
      <Link
        href={`/kategoriak/${category.slug}`}
        className="block relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden"
      >
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl opacity-10">🧯</span>
          </div>
        )}

        {/* Product count pill - top right */}
        {category.productCount > 0 && (
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-600 px-2.5 py-1 rounded-full shadow-sm">
            {category.productCount} termék
          </span>
        )}
      </Link>

      {/* Bottom: content */}
      <div className="p-5">
        {/* Category name */}
        <Link
          href={`/kategoriak/${category.slug}`}
          className="block text-lg font-bold text-gray-900 group-hover:text-amber-500 transition-colors leading-tight mb-3"
        >
          {category.name}
        </Link>

        {/* Subcategories - capped at MAX_CHILDREN */}
        {visibleChildren.length > 0 && (
          <div className="flex flex-col gap-1">
            {visibleChildren.map((child, idx) => (
              <Link
                key={idx}
                href={`/kategoriak/${child.slug}`}
                className="group/link flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-500 transition-colors py-0.5"
              >
                <ChevronRight className="h-3 w-3 text-gray-300 group-hover/link:text-amber-400 transition-colors flex-shrink-0" />
                <span className="truncate">{child.name}</span>
              </Link>
            ))}
            {remainingCount > 0 && (
              <Link
                href={`/kategoriak/${category.slug}`}
                className="text-xs font-medium text-amber-500 hover:text-amber-600 transition-colors mt-1 ml-4.5"
              >
                +{remainingCount} további
              </Link>
            )}
          </div>
        )}

        {/* View all link */}
        {visibleChildren.length === 0 && (
          <Link
            href={`/kategoriak/${category.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-500 hover:text-amber-600 transition-colors"
          >
            Termékek megtekintése
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
