import Image from 'next/image';
import { Link } from '@/i18n/navigation';

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
  size: 'big' | 'small';
}

interface CategoryCardsProps {
  categories: {
    documentId?: string;
    name: string;
    slug: string;
    count?: number;
    image?: { url: string } | null;
    children?: { name: string; slug: string; count?: number }[];
  }[];
}

// Category layout config from Figma - defines order and sizes
const categoryLayout: {
  slugs: string[]; // possible slugs to match
  size: 'big' | 'small';
}[] = [
  { slugs: ['tuzcsapszekrenyek', 'tuzcsap-szekrenyek'], size: 'big' },
  { slugs: ['tuzolto-szerelvenyek'], size: 'small' },
  { slugs: ['tuzcsapok'], size: 'small' },
  { slugs: ['tuzolto-keszulekek'], size: 'small' },
  { slugs: ['passziv-tuzvedelme', 'passziv-tuzvedelmi-termekek'], size: 'small' },
  { slugs: ['tomlok', 'tomlo', 'tuztomlo', 'tuz-tomlo', 'tuzolto-tomlo'], size: 'big' },
];

export function CategoryCards({ categories }: CategoryCardsProps) {
  // Collect all categories/subcategories with "tömlő" in their name for the Tömlők card
  const tomloChildren: CategoryChild[] = [];
  let tomloProductCount = 0;
  let tomloImage: string | null = null;

  categories.forEach((cat) => {
    // Skip categories with null name or slug
    if (!cat.name || !cat.slug) return;

    // Check main category
    if (cat.name.toLowerCase().includes('tömlő') || cat.slug.includes('tomlo')) {
      tomloChildren.push({
        name: cat.name,
        slug: cat.slug,
        count: cat.count || 0,
      });
      tomloProductCount += cat.count || 0;
      if (!tomloImage && cat.image?.url) tomloImage = cat.image.url;
    }
    // Check children
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

  // Map layout config to categories from API
  const displayCategories = categoryLayout
    .map((layout): CategoryCardData | null => {
      // Special handling for Tömlők - use collected subcategories
      if (layout.slugs.includes('tomlok')) {
        if (tomloChildren.length === 0) return null;
        return {
          id: 'tomlok',
          name: 'Tömlők',
          slug: 'tomlok',
          productCount: tomloProductCount,
          image: tomloImage,
          children: tomloChildren.slice(0, 10),
          size: layout.size,
        };
      }

      // Find matching category
      const matchedCat = categories.find((cat) =>
        cat.slug && layout.slugs.some((slug) => cat.slug.includes(slug) || slug.includes(cat.slug))
      );

      if (!matchedCat) return null;

      // Get children with counts
      const children = matchedCat.children?.map(child => ({
        name: child.name,
        slug: child.slug,
        count: child.count || 0,
      })) || [];

      // Calculate total product count (parent + all children)
      const totalProductCount = (matchedCat.count || 0) +
        children.reduce((sum, child) => sum + (child.count || 0), 0);

      return {
        id: matchedCat.documentId || matchedCat.slug,
        name: matchedCat.name,
        slug: matchedCat.slug,
        productCount: totalProductCount,
        image: matchedCat.image?.url || null,
        children: children.slice(0, 10),
        size: layout.size,
      };
    })
    .filter((cat): cat is CategoryCardData => cat !== null);

  // Organize into grid layout:
  // Row 1-2: Big card left (spans 2 rows), 2 small cards right (stacked)
  // Row 3-4: 2 small cards left (stacked), Big card right (spans 2 rows)
  const bigCards = displayCategories.filter(c => c.size === 'big');
  const smallCards = displayCategories.filter(c => c.size === 'small');

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Row 1-2: Big card left + 2 small cards right */}
          <div className="flex flex-col">
            {bigCards[0] && <BigCard category={bigCards[0]} />}
          </div>
          <div className="flex flex-col gap-6">
            {smallCards[0] && <SmallCard category={smallCards[0]} />}
            {smallCards[1] && <SmallCard category={smallCards[1]} />}
          </div>

          {/* Row 3-4: 2 small cards left + Big card right */}
          <div className="flex flex-col gap-6">
            {smallCards[2] && <SmallCard category={smallCards[2]} />}
            {smallCards[3] && <SmallCard category={smallCards[3]} />}
          </div>
          <div className="flex flex-col">
            {bigCards[1] && <BigCard category={bigCards[1]} />}
          </div>
        </div>
      </div>
    </section>
  );
}

function BigCard({ category }: { category: CategoryCardData }) {
  return (
    <div className="group bg-[#f6f6f6] rounded-[20px] p-6 lg:p-8 flex items-start h-full overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex items-center w-full h-full">
        {/* Left content */}
        <div className="flex flex-col gap-4 flex-shrink-0 w-[55%] lg:w-[50%]">
          {/* Product count badge */}
          <div className="bg-white rounded-full px-4 py-2.5 w-fit">
            <span className="text-lg lg:text-xl">
              <span className="font-medium text-[#FFBB36]">{category.productCount}+</span>
              <span className="text-black"> Termék</span>
            </span>
          </div>

          {/* Category title */}
          <Link href={`/kategoriak/${category.slug}`}>
            <h3 className="text-[34px] font-medium text-black leading-[1.15] hover:text-[#FFBB36] transition-colors">
              {category.name}
            </h3>
          </Link>

          {/* Subcategory list */}
          <div className="flex flex-col gap-2 lg:gap-3">
            {category.children && category.children.length > 0 ? (
              category.children.slice(0, 10).map((child, idx) => (
                <Link
                  key={idx}
                  href={`/kategoriak/${child.slug}`}
                  className="text-base lg:text-xl text-black/60 hover:text-[#FFBB36] transition-colors"
                >
                  {child.name}
                </Link>
              ))
            ) : (
              // Placeholder items if no children
              Array.from({ length: 6 }).map((_, idx) => (
                <span key={idx} className="text-base lg:text-xl text-black/60">
                  Alkategória {idx + 1}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Right image */}
        <Link href={`/kategoriak/${category.slug}`} className="relative flex-1 h-full min-h-[300px]">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-contain object-right transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 45vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl opacity-30">🧯</span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}

function SmallCard({ category }: { category: CategoryCardData }) {
  return (
    <div className="group bg-[#f6f6f6] rounded-[20px] p-6 lg:p-8 flex items-start overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex items-center w-full">
        {/* Left content */}
        <div className="flex flex-col gap-4 flex-shrink-0 w-[55%] lg:w-[50%]">
          {/* Product count badge */}
          <div className="bg-white rounded-full px-4 py-2.5 w-fit">
            <span className="text-lg lg:text-xl">
              <span className="font-medium text-[#FFBB36]">{category.productCount}+</span>
              <span className="text-black"> Termék</span>
            </span>
          </div>

          {/* Category title */}
          <Link href={`/kategoriak/${category.slug}`}>
            <h3 className="text-[34px] font-medium text-black leading-[1.15] hover:text-[#FFBB36] transition-colors">
              {category.name}
            </h3>
          </Link>

          {/* Subcategory list */}
          <div className="flex flex-col gap-2 lg:gap-3">
            {category.children && category.children.length > 0 ? (
              category.children.slice(0, 4).map((child, idx) => (
                <Link
                  key={idx}
                  href={`/kategoriak/${child.slug}`}
                  className="text-base lg:text-xl text-black/60 hover:text-[#FFBB36] transition-colors"
                >
                  {child.name}
                </Link>
              ))
            ) : (
              // Placeholder items if no children
              Array.from({ length: 4 }).map((_, idx) => (
                <span key={idx} className="text-base lg:text-xl text-black/60">
                  Alkategória {idx + 1}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Right image */}
        <Link href={`/kategoriak/${category.slug}`} className="relative flex-1 h-[180px] lg:h-[240px]">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-contain object-right transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 45vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-30">🧯</span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
