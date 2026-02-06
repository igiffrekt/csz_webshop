import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

interface CategoryChild {
  _id?: string;
  name: string;
  slug: string;
  count?: number;
}

interface CategoryItem {
  _id?: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: { url: string } | null;
  count?: number;
  children?: CategoryChild[];
  parent?: unknown;
}

interface CategoryGridProps {
  categories: CategoryItem[];
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
      <div className="site-container">
        {/* Category grid - 2 columns on large, 1 on small */}
        <div className="grid md:grid-cols-2 gap-6">
          {displayCategories.map((category, index) => (
            <CategoryCard
              key={category._id || category.slug}
              category={category}
              imagePosition={index % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CategoryCardProps {
  category: CategoryItem;
  imagePosition?: 'left' | 'right';
}

function CategoryCard({ category, imagePosition = 'left' }: CategoryCardProps) {
  const imageUrl = category.image?.url || null;
  const imageAlt = category.name;

  const subcategories = category.children && category.children.length > 0
    ? category.children.slice(0, 6)
    : getDefaultSubcategories(category.slug);

  const productCount = category.count || 0;

  return (
    <div className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className={`flex flex-col sm:flex-row ${imagePosition === 'right' ? 'sm:flex-row-reverse' : ''}`}>
        {/* Image section */}
        <div className="relative w-full sm:w-2/5 aspect-square sm:aspect-auto sm:min-h-[280px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <span className="text-6xl">
                {getCategoryEmoji(category.slug)}
              </span>
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
          {/* Item count badge */}
          {productCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 bg-amber-400 text-gray-900 text-xs font-semibold rounded-full w-fit mb-3">
              {productCount} termék
            </span>
          )}

          {/* Category name */}
          <Link href={`/kategoriak/${category.slug}`}>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors mb-4">
              {category.name}
            </h3>
          </Link>

          {/* Subcategory list */}
          {subcategories.length > 0 && (
            <ul className="space-y-2">
              {subcategories.map((sub, index) => (
                <li key={index}>
                  <Link
                    href={`/kategoriak/${typeof sub === 'string' ? sub : sub.slug}`}
                    className="text-sm text-gray-600 hover:text-amber-600 transition-colors inline-flex items-center gap-1"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    {typeof sub === 'string' ? sub : sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* View all link */}
          <Link
            href={`/kategoriak/${category.slug}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            Összes megtekintése
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Get category emoji
function getCategoryEmoji(slug: string): string {
  const emojiMap: Record<string, string> = {
    'tuzolto-keszulekek': '🧯',
    'tuzjelzo-rendszerek': '🔔',
    'vedofelszerelesek': '🛡️',
    'kiegeszitok': '🔧',
    'porolto': '🧯',
    'co2-olto': '🧯',
    'habolto': '🧯',
    'tartok': '📦',
    'jelzotablak': '⚠️',
  };
  return emojiMap[slug] || '📦';
}

// Get default subcategories for fallback
function getDefaultSubcategories(slug: string): string[] {
  const subcategoryMap: Record<string, string[]> = {
    'tuzolto-keszulekek': ['Poroltó készülékek', 'CO2 oltók', 'Haboltó készülékek', 'Vízköddel oltók', 'Zsíroltók'],
    'tuzjelzo-rendszerek': ['Füstérzékelők', 'Hőérzékelők', 'Kombinált érzékelők', 'Kézi jelzésadók'],
    'vedofelszerelesek': ['Tűzálló szekrények', 'Tűzálló páncélszekrények', 'Menekülési eszközök'],
    'kiegeszitok': ['Tartók és állványok', 'Jelzőtáblák', 'Ellenőrzési kartonok', 'Plombák'],
    'porolto': ['ABC poroltó', 'BC poroltó', 'D poroltó'],
    'co2-olto': ['2 kg-os CO2', '5 kg-os CO2', '10 kg-os CO2'],
  };
  return subcategoryMap[slug] || ['Részletek megtekintése'];
}

// Default categories if none from API
const defaultCategories: CategoryItem[] = [
  { _id: '1', name: 'Tűzoltó készülékek', slug: 'tuzolto-keszulekek', children: [], count: 0 },
  { _id: '2', name: 'Tűzjelző rendszerek', slug: 'tuzjelzo-rendszerek', children: [], count: 0 },
  { _id: '3', name: 'Poroltó készülékek', slug: 'porolto', children: [], count: 0 },
  { _id: '4', name: 'CO2 oltók', slug: 'co2-olto', children: [], count: 0 },
  { _id: '5', name: 'Védőfelszerelések', slug: 'vedofelszerelesek', children: [], count: 0 },
  { _id: '6', name: 'Kiegészítők', slug: 'kiegeszitok', children: [], count: 0 },
];
