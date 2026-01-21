'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Grid3X3, Flame } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { Category, StrapiListResponse } from '@csz/types';

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'tuzolto-keszulekek': <Flame className="h-4 w-4" />,
};

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data: StrapiListResponse<Category> = await res.json();
          // Only get top-level categories (those without a parent)
          const topLevel = data.data.filter((cat) => !cat.parent);
          setCategories(topLevel);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Fallback categories for when API is unavailable
  const fallbackCategories = [
    {
      name: 'Tűzoltó készülékek',
      slug: 'tuzolto-keszulekek',
      children: [
        { name: 'Poroltó készülékek', slug: 'porolto' },
        { name: 'CO2 oltók', slug: 'co2-olto' },
        { name: 'Haboltó készülékek', slug: 'habolto' },
      ],
    },
    {
      name: 'Tűzjelző rendszerek',
      slug: 'tuzjelzo-rendszerek',
      children: [
        { name: 'Füstérzékelők', slug: 'fusterzekelok' },
        { name: 'Hőérzékelők', slug: 'hoerzekelok' },
      ],
    },
    {
      name: 'Védőfelszerelések',
      slug: 'vedofelszerelesek',
      children: [
        { name: 'Tűzálló szekrények', slug: 'tuzallo-szekrenyek' },
      ],
    },
    {
      name: 'Kiegészítők',
      slug: 'kiegeszitok',
      children: [
        { name: 'Tartók és állványok', slug: 'tartok' },
        { name: 'Jelzőtáblák', slug: 'jelzotablak' },
      ],
    },
  ];

  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger button */}
      <button
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors',
          'bg-primary-500 text-white hover:bg-primary-600',
          isOpen && 'bg-primary-600'
        )}
      >
        <Grid3X3 className="h-5 w-5" />
        <span>Kategóriák</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown menu */}
      <div
        className={cn(
          'absolute left-0 top-full pt-2 z-50 transition-all duration-200',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
      >
        <div className="bg-white rounded-lg shadow-xl border p-6 min-w-[500px] lg:min-w-[700px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {displayCategories.map((category) => (
                  <div key={category.slug}>
                    <Link
                      href={`/kategoriak/${category.slug}`}
                      className="flex items-center gap-2 font-semibold text-secondary-900 hover:text-primary-500 transition-colors"
                    >
                      {categoryIcons[category.slug]}
                      {category.name}
                    </Link>
                    {category.children && category.children.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {category.children.slice(0, 5).map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={`/kategoriak/${sub.slug}`}
                              className="text-sm text-secondary-600 hover:text-primary-500 transition-colors block py-0.5"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                        {category.children.length > 5 && (
                          <li>
                            <Link
                              href={`/kategoriak/${category.slug}`}
                              className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                            >
                              + {category.children.length - 5} további
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom promo */}
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <p className="text-sm text-secondary-600">
                  Nem találja amit keres?
                </p>
                <Link
                  href="/kategoriak"
                  className="text-sm font-medium text-primary-500 hover:text-primary-600"
                >
                  Összes kategória →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
