'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
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
  children?: CategoryChild[];
  peekDirection: 'right' | 'bottom';
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
}

// Category layout config - defines which categories to show
const categoryConfig: string[][] = [
  ['tuzcsapszekrenyek', 'tuzcsap-szekrenyek'],
  ['tuzolto-szerelvenyek'],
  ['tuzcsapok'],
  ['tuzolto-keszulekek'],
  ['tomlok', 'tomlo', 'tuztomlo', 'tuz-tomlo', 'tuzolto-tomlo'],
  ['passziv-tuzvedelme', 'passziv-tuzvedelmi-termekek'],
];

// Helper to find a product image for a category
function findProductImageForCategory(
  categorySlug: string,
  products: Product[]
): string | null {
  const product = products.find((p) =>
    p.categories?.some((cat) => { const s = getSlugString(cat.slug); return s === categorySlug || s.includes(categorySlug) || categorySlug.includes(s); })
  );

  if (!product) return null;

  if (product.cloudinaryImageUrl) {
    return product.cloudinaryImageUrl;
  }

  if (product.images?.[0]?.url) {
    return getImageUrl(product.images[0].url);
  }

  return null;
}

// Seeded random for consistent peek directions
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 2;
}

export function CategoryCards({ categories, products = [] }: CategoryCardsProps) {
  // Collect all categories/subcategories with "tömlő" in their name for the Tömlők card
  const tomloChildren: CategoryChild[] = [];
  let tomloProductCount = 0;
  let tomloImage: string | null = null;

  categories.forEach((cat) => {
    if (!cat.name || !cat.slug) return;

    if (cat.name.toLowerCase().includes('tömlő') || cat.slug.includes('tomlo')) {
      tomloChildren.push({
        name: cat.name,
        slug: cat.slug,
        count: cat.count || 0,
      });
      tomloProductCount += cat.count || 0;
      if (!tomloImage && cat.image?.url) tomloImage = cat.image.url;
    }

    cat.children?.forEach((child) => {
      if (!child.name || !child.slug) return;
      if (child.name.toLowerCase().includes('tömlő') || child.slug.includes('tomlo')) {
        tomloChildren.push({
          name: child.name,
          slug: child.slug,
          count: child.count || 0,
        });
        tomloProductCount += child.count || 0;
      }
    });
  });

  // Map config to categories from API
  const displayCategories = useMemo(() => {
    return categoryConfig
      .map((slugs, index): CategoryCardData | null => {
        // Determine peek direction based on index for consistent but varied layout
        const peekDirection = index % 2 === 0 ? 'right' : 'bottom';

        // Special handling for Tömlők
        if (slugs.includes('tomlok')) {
          if (tomloChildren.length === 0) return null;

          let image = tomloImage;
          if (!image) {
            for (const child of tomloChildren) {
              const productImage = findProductImageForCategory(child.slug, products);
              if (productImage) {
                image = productImage;
                break;
              }
            }
          }

          return {
            id: 'tomlok',
            name: 'Tömlők',
            slug: 'tomlok',
            productCount: tomloProductCount,
            image,
            children: tomloChildren.slice(0, 10),
            peekDirection,
          };
        }

        const matchedCat = categories.find((cat) =>
          cat.slug && slugs.some((slug) => cat.slug.includes(slug) || slug.includes(cat.slug))
        );

        if (!matchedCat) return null;

        const children = matchedCat.children?.map(child => ({
          name: child.name,
          slug: child.slug,
          count: child.count || 0,
        })) || [];

        const totalProductCount = (matchedCat.count || 0) +
          children.reduce((sum, child) => sum + (child.count || 0), 0);

        let image = matchedCat.image?.url || null;
        if (!image) {
          image = findProductImageForCategory(matchedCat.slug, products);
          if (!image && children.length > 0) {
            for (const child of children) {
              const productImage = findProductImageForCategory(child.slug, products);
              if (productImage) {
                image = productImage;
                break;
              }
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
          peekDirection,
        };
      })
      .filter((cat): cat is CategoryCardData => cat !== null);
  }, [categories, products, tomloChildren, tomloProductCount, tomloImage]);

  // Organize into masonry columns
  const leftColumn = displayCategories.filter((_, i) => [0, 3, 5].includes(i));
  const rightColumn = displayCategories.filter((_, i) => [1, 2, 4].includes(i));

  return (
    <section className="py-12 lg:py-20 bg-white">
      <div className="site-container">
        {/* Section header */}
        <div className="text-center mb-10 lg:mb-14">
          <span className="text-gray-500 text-sm uppercase tracking-wider">
            Kategóriák
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
            Termékkategóriák
          </h2>
        </div>

        {/* Masonry Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-5 lg:gap-6">
            {leftColumn.map((category) => (
              <MasonryCard key={category.id} category={category} />
            ))}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-5 lg:gap-6">
            {rightColumn.map((category) => (
              <MasonryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MasonryCard({ category }: { category: CategoryCardData }) {
  const hasChildren = category.children && category.children.length > 0;
  const isBottomPeek = category.peekDirection === 'bottom';

  return (
    <div className="group relative">
      {/* Card container - allows image overflow */}
      <div className="relative bg-[#f8f8f8] rounded-[24px] overflow-visible">
        {/* Inner container with hover effects */}
        <div className="relative rounded-[24px] overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className={`flex ${isBottomPeek ? 'flex-col' : ''}`}>
            {/* Content section */}
            <div className={`flex flex-col p-6 lg:p-8 relative z-10 ${isBottomPeek ? 'w-full' : 'w-[70%]'}`}>
              {/* Product count badge */}
              <div className="inline-flex items-center gap-1.5 bg-white rounded-full px-4 py-2 w-fit shadow-sm mb-4">
                <span className="text-[#FFBB36] font-semibold text-base lg:text-lg">
                  {category.productCount}+
                </span>
                <span className="text-gray-700 text-base lg:text-lg">Termék</span>
              </div>

              {/* Category title */}
              <Link href={`/kategoriak/${category.slug}`}>
                <h3 className="text-2xl lg:text-[32px] font-bold text-gray-900 leading-tight mb-4 hover:text-[#FFBB36] transition-colors">
                  {category.name}
                </h3>
              </Link>

              {/* Subcategory list - only show if there are children */}
              {hasChildren && (
                <div className="flex flex-col gap-2 pb-2">
                  {category.children!.map((child, idx) => (
                    <Link
                      key={idx}
                      href={`/kategoriak/${child.slug}`}
                      className="text-sm lg:text-base text-gray-500 hover:text-[#FFBB36] transition-colors leading-relaxed"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Image section - PEEK EFFECT */}
            {isBottomPeek ? (
              /* Bottom peek - image at bottom, overflows downward */
              <Link
                href={`/kategoriak/${category.slug}`}
                className="relative w-full h-[200px] lg:h-[280px] flex items-center justify-center"
              >
                {category.image ? (
                  <div className="absolute inset-0 overflow-visible">
                    <div className="relative w-full h-[150%] -translate-y-[10%]">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-contain object-center transition-transform duration-500 group-hover:scale-110 drop-shadow-xl"
                        sizes="(max-width: 1024px) 80vw, 40vw"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <span className="text-[140px]">🧯</span>
                  </div>
                )}
              </Link>
            ) : (
              /* Right peek - image on right side, overflows rightward */
              <Link
                href={`/kategoriak/${category.slug}`}
                className="absolute right-0 top-0 bottom-0 w-[35%] overflow-visible"
              >
                {category.image ? (
                  <div className="absolute inset-0 overflow-visible">
                    {/* Image container extends beyond card boundary */}
                    <div className="relative w-[180%] h-full min-h-[280px]">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-contain object-right transition-transform duration-500 group-hover:scale-110 drop-shadow-xl"
                        sizes="(max-width: 1024px) 50vw, 30vw"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <span className="text-[140px]">🧯</span>
                  </div>
                )}
              </Link>
            )}
          </div>

          {/* Gradient overlay for text readability */}
          {!isBottomPeek && (
            <div className="absolute inset-y-0 left-0 w-[75%] bg-gradient-to-r from-[#f8f8f8] via-[#f8f8f8]/80 to-transparent pointer-events-none z-[5]" />
          )}
        </div>
      </div>
    </div>
  );
}
