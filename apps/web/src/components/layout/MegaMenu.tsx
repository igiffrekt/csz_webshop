'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, Grid3X3, Flame, Home, Package, Users, Phone } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { Category, StrapiListResponse } from '@csz/types';

// Main navigation links
const mainNavLinks = [
  { href: '/', label: 'Címlap', icon: Home },
  { href: '/termekek', label: 'Termékek', icon: Package },
  { href: '/rolunk', label: 'Rólunk', icon: Users },
  { href: '/kapcsolat', label: 'Kapcsolat', icon: Phone },
];

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'tuzolto-keszulekek': <Flame className="h-4 w-4" />,
};

interface MegaMenuProps {
  variant?: 'default' | 'icon';
}

export function MegaMenu({ variant = 'default' }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        // Use absolute path to bypass locale routing
        const res = await fetch(`${window.location.origin}/api/categories`);
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim()) {
            const data: StrapiListResponse<Category> = JSON.parse(text);
            // Only get top-level categories (those without a parent)
            const topLevel = data.data?.filter((cat) => !cat.parent) || [];
            setCategories(topLevel);
          }
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
      {variant === 'icon' ? (
        <button
          className="flex items-center justify-center w-[37px] h-[39px] hover:opacity-70 transition-opacity"
          aria-label="Kategóriák"
        >
          <Image src="/icons/nav-icon.svg" alt="Menü" width={29} height={29} />
        </button>
      ) : (
        <button
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold transition-colors',
            'bg-amber-400 text-gray-900 hover:bg-amber-500',
            isOpen && 'bg-amber-500'
          )}
        >
          <Grid3X3 className="h-5 w-5" />
          <span>Összes kategória</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      )}

      {/* Dropdown menu */}
      <div
        className={cn(
          'absolute left-0 top-full pt-2 z-50 transition-all duration-200',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
      >
        <div className="bg-white rounded-lg shadow-xl border p-6 min-w-[500px] lg:min-w-[700px]">
          {/* Main navigation links */}
          <div className="flex items-center gap-6 pb-4 mb-4 border-b border-gray-200">
            {mainNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#FFBB36] font-medium transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

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
