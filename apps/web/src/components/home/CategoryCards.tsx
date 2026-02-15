'use client';

import { useMemo, useState, useCallback } from 'react';
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
  ['passziv-tuzvedelem', 'passziv-tuzvedelme', 'passziv-tuzvedelmi-termekek'],
];

// Each card gets a distinct color scheme + image position override
// imagePos: 'bottom' (default), 'right', 'bottom-right'
const cardThemes = [
  { card: 'from-amber-50 to-orange-50', bar: 'bg-amber-500', badge: 'bg-amber-500 text-white', link: 'text-amber-600 hover:text-amber-700', chevron: 'text-amber-400', hover: 'hover:shadow-amber-100/60', imagePos: 'right' as const },
  { card: 'from-red-50 to-rose-50', bar: 'bg-red-500', badge: 'bg-red-500 text-white', link: 'text-red-600 hover:text-red-700', chevron: 'text-red-400', hover: 'hover:shadow-red-100/60', imagePos: 'bottom-right' as const },
  { card: 'from-sky-50 to-blue-50', bar: 'bg-blue-500', badge: 'bg-blue-500 text-white', link: 'text-blue-600 hover:text-blue-700', chevron: 'text-blue-400', hover: 'hover:shadow-blue-100/60', imagePos: 'bottom-right' as const },
  { card: 'from-emerald-50 to-teal-50', bar: 'bg-emerald-500', badge: 'bg-emerald-500 text-white', link: 'text-emerald-600 hover:text-emerald-700', chevron: 'text-emerald-400', hover: 'hover:shadow-emerald-100/60', imagePos: 'bottom' as const },
  { card: 'from-orange-50 to-yellow-50', bar: 'bg-orange-500', badge: 'bg-orange-500 text-white', link: 'text-orange-600 hover:text-orange-700', chevron: 'text-orange-400', hover: 'hover:shadow-orange-100/60', imagePos: 'right' as const },
  { card: 'from-violet-50 to-purple-50', bar: 'bg-violet-500', badge: 'bg-violet-500 text-white', link: 'text-violet-600 hover:text-violet-700', chevron: 'text-violet-400', hover: 'hover:shadow-violet-100/60', imagePos: 'right' as const },
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
    <section className="py-14 lg:py-24 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50">
      <div className="site-container">
        {/* Section header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block bg-amber-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            {sectionSubtitle || 'Kategóriák'}
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-gray-900">
            {sectionTitle || 'Termékkategóriák'}
          </h2>
        </div>

        {/* Row 1: one wide card + one narrow card */}
        <div className="flex flex-col lg:flex-row gap-5 mb-5">
          <div className="lg:flex-[2]">
            <CategoryCard category={displayCategories[0]} theme={cardThemes[0]} variant="wide" />
          </div>
          {displayCategories[1] && (
            <div className="lg:flex-[1]">
              <CategoryCard category={displayCategories[1]} theme={cardThemes[1]} variant="tall" />
            </div>
          )}
        </div>

        {/* Row 2: three equal cards */}
        {displayCategories.length > 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {displayCategories.slice(2, 5).map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} theme={cardThemes[i + 2]} variant="compact" />
            ))}
          </div>
        )}

        {/* Row 3: remaining card as full-width banner */}
        {displayCategories[5] && (
          <CategoryCard category={displayCategories[5]} theme={cardThemes[5]} variant="banner" />
        )}
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  theme,
  variant,
}: {
  category: CategoryCardData;
  theme: (typeof cardThemes)[number];
  variant: 'wide' | 'tall' | 'compact' | 'banner';
}) {
  const hasImage = !!category.image;

  if (variant === 'wide') {
    return (
      <div className={`group relative bg-gradient-to-br ${theme.card} rounded-2xl border border-white/80 overflow-hidden hover:shadow-xl hover:scale-[1.02] ${theme.hover} transition-all duration-300 h-full`}>
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.bar} z-10`} />
        <div className="flex flex-col sm:flex-row h-full">
          <div className="flex flex-col p-6 lg:p-8 sm:flex-1 min-w-0 relative z-10">
            <div className="flex items-start justify-between gap-3 mb-4">
              <Link href={`/kategoriak/${category.slug}`}>
                <h3 className="text-2xl font-extrabold text-gray-900 leading-tight group-hover:text-amber-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
              <span className={`flex-shrink-0 inline-flex items-center ${theme.badge} rounded-full px-3 py-1 text-xs font-bold shadow-sm`}>
                {category.productCount} termék
              </span>
            </div>
            <SubcategoryList items={category.children} slug={category.slug} chevronColor={theme.chevron} linkColor={theme.link} />
            <div className="mt-auto pt-4">
              <Link
                href={`/kategoriak/${category.slug}`}
                className={`inline-flex items-center gap-1.5 text-sm font-bold ${theme.link} transition-colors`}
              >
                Összes termék <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          {hasImage && (
            <Link href={`/kategoriak/${category.slug}`} className="relative sm:w-[260px] h-[120px] sm:h-auto flex-shrink-0 overflow-visible">
              <div className="absolute inset-0 overflow-visible">
                <div className="relative w-[160%] h-full">
                  <Image src={category.image!} alt={category.name} fill className="object-contain object-right transition-transform duration-500 group-hover:scale-110 drop-shadow-xl" sizes="(max-width: 1024px) 50vw, 30vw" />
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'tall') {
    return (
      <div className={`group relative bg-gradient-to-br ${theme.card} rounded-2xl border border-white/80 overflow-hidden hover:shadow-xl hover:scale-[1.02] ${theme.hover} transition-all duration-300 h-full flex flex-col`}>
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.bar}`} />
        <div className="flex flex-col flex-1 p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <Link href={`/kategoriak/${category.slug}`}>
              <h3 className="text-xl font-extrabold text-gray-900 leading-tight group-hover:text-amber-600 transition-colors">
                {category.name}
              </h3>
            </Link>
            <span className={`flex-shrink-0 inline-flex items-center ${theme.badge} rounded-full px-3 py-1 text-xs font-bold shadow-sm`}>
              {category.productCount} termék
            </span>
          </div>
          <SubcategoryList items={category.children} slug={category.slug} chevronColor={theme.chevron} linkColor={theme.link} />
          <div className="mt-auto pt-4">
            <Link
              href={`/kategoriak/${category.slug}`}
              className={`inline-flex items-center gap-1.5 text-sm font-bold ${theme.link} transition-colors`}
            >
              Összes termék <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
        {/* Bottom-right image area */}
        {hasImage && (
          <div className="relative h-[100px] flex-shrink-0 overflow-visible">
            <div className="absolute bottom-0 right-0 w-[70%] h-[220%] overflow-visible">
              <Image src={category.image!} alt={category.name} fill className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-110 drop-shadow-xl" sizes="(max-width: 1024px) 40vw, 25vw" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`group relative bg-gradient-to-br ${theme.card} rounded-2xl border border-white/80 overflow-hidden hover:shadow-xl hover:scale-[1.02] ${theme.hover} transition-all duration-300`}>
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.bar}`} />
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col p-6 lg:p-8 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-4">
              <Link href={`/kategoriak/${category.slug}`}>
                <h3 className="text-xl font-extrabold text-gray-900 leading-tight group-hover:text-amber-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
              <span className={`flex-shrink-0 inline-flex items-center ${theme.badge} rounded-full px-3 py-1 text-xs font-bold shadow-sm`}>
                {category.productCount} termék
              </span>
            </div>
            {category.children.length > 0 ? (
              <DockList items={category.children} chevronColor={theme.chevron} linkColor={theme.link} layout="grid" />
            ) : (
              <Link
                href={`/kategoriak/${category.slug}`}
                className={`inline-flex items-center gap-1.5 text-sm font-bold ${theme.link} transition-colors`}
              >
                Termékek megtekintése <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          {hasImage && (
            <Link href={`/kategoriak/${category.slug}`} className="relative sm:w-[220px] h-[100px] sm:h-auto flex-shrink-0 overflow-visible">
              <div className="absolute inset-0 overflow-visible">
                <div className="relative w-[150%] h-full">
                  <Image src={category.image!} alt={category.name} fill className="object-contain object-right transition-transform duration-500 group-hover:scale-110 drop-shadow-xl" sizes="(max-width: 1024px) 40vw, 20vw" />
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // compact
  const imgPos = theme.imagePos || 'bottom';

  return (
    <div className={`group relative bg-gradient-to-br ${theme.card} rounded-2xl border border-white/80 overflow-hidden hover:shadow-xl hover:scale-[1.02] ${theme.hover} transition-all duration-300 h-full flex flex-col`}>
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.bar}`} />
      {/* Bottom-right image: overlay positioned inside the card */}
      {hasImage && imgPos === 'bottom-right' && (
        <Link href={`/kategoriak/${category.slug}`} className="absolute bottom-0 right-0 w-[55%] h-[75%] z-0 pointer-events-auto">
          <Image src={category.image!} alt={category.name} fill className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-110 drop-shadow-xl" sizes="300px" />
        </Link>
      )}
      <div className={`flex flex-col flex-1 p-5 lg:p-6 relative z-10 ${imgPos === 'right' ? 'pr-[120px]' : ''}`}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link href={`/kategoriak/${category.slug}`}>
            <h3 className="text-lg font-extrabold text-gray-900 leading-tight group-hover:text-amber-600 transition-colors">
              {category.name}
            </h3>
          </Link>
          <span className={`flex-shrink-0 inline-flex items-center ${theme.badge} rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sm`}>
            {category.productCount}
          </span>
        </div>
        {category.children.length > 0 ? (
          <DockList items={category.children} chevronColor={theme.chevron} linkColor={theme.link} />
        ) : (
          <Link
            href={`/kategoriak/${category.slug}`}
            className={`inline-flex items-center gap-1.5 text-sm font-bold ${theme.link} transition-colors`}
          >
            Termékek megtekintése <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        {/* Right-aligned image: absolutely positioned inside the content area */}
        {hasImage && imgPos === 'right' && (
          <div className="absolute right-0 top-0 bottom-0 w-[130px] overflow-visible">
            <div className="relative w-[180%] h-full">
              <Image src={category.image!} alt={category.name} fill className="object-contain object-right transition-transform duration-500 group-hover:scale-110 drop-shadow-xl" sizes="300px" />
            </div>
          </div>
        )}
      </div>
      {/* Bottom-center image */}
      {hasImage && imgPos === 'bottom' && (
        <div className="relative h-[60px] flex-shrink-0 overflow-visible">
          <div className="absolute inset-0 overflow-visible">
            <div className="relative w-full h-[250%] -translate-y-[30%]">
              <Image src={category.image!} alt={category.name} fill className="object-contain object-center transition-transform duration-500 group-hover:scale-110 drop-shadow-xl" sizes="300px" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DockList({
  items,
  chevronColor,
  linkColor,
  layout = 'column',
}: {
  items: CategoryChild[];
  chevronColor: string;
  linkColor: string;
  layout?: 'column' | 'grid';
}) {
  const [activeIdx, setActiveIdx] = useState(-1);

  const getScale = useCallback((index: number) => {
    if (activeIdx === -1) return 1;
    const d = Math.abs(index - activeIdx);
    if (d === 0) return 1.1;
    if (d === 1) return 1.05;
    if (d === 2) return 1.02;
    return 1;
  }, [activeIdx]);

  if (items.length === 0) return null;

  // Extract the hover class directly from linkColor (e.g. 'text-amber-600 hover:text-amber-700' → 'hover:text-amber-700')
  const hoverColor = linkColor.split(' ').find(c => c.startsWith('hover:')) || '';

  return (
    <div
      className={layout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-0.5' : 'flex flex-col gap-0.5'}
      onMouseLeave={() => setActiveIdx(-1)}
    >
      {items.map((child, idx) => (
        <Link
          key={idx}
          href={`/kategoriak/${child.slug}`}
          className={`group/link flex items-center gap-1.5 text-sm text-gray-600 ${hoverColor} py-0.5 origin-left transition-all duration-200 ease-out`}
          style={{ transform: `scale(${getScale(idx)})` }}
          onMouseEnter={() => setActiveIdx(idx)}
        >
          <ChevronRight className={`h-3 w-3 ${chevronColor} transition-colors flex-shrink-0`} />
          <span className="truncate">{child.name}</span>
        </Link>
      ))}
    </div>
  );
}

function SubcategoryList({ items, slug, chevronColor, linkColor }: { items: CategoryChild[]; slug: string; chevronColor: string; linkColor: string }) {
  if (items.length === 0) return null;
  return <DockList items={items} chevronColor={chevronColor} linkColor={linkColor} />;
}
