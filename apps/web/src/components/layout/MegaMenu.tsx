'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, Grid3X3, Flame, Home, Package, Users, Phone, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { getSlugString } from '@/lib/formatters';
import type { Category, MenuItem } from '@csz/types';

// Static info links (always shown in dropdown)
const infoLinks = [
  { href: '/', label: 'Címlap', icon: Home },
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch menu items
        const menuRes = await fetch(`${window.location.origin}/api/menu`);
        if (menuRes.ok) {
          const menuData = await menuRes.json();
          setMenuItems(menuData.data || []);
        }

        // Only fetch categories for default variant
        if (variant === 'default') {
          const res = await fetch(`${window.location.origin}/api/categories`);
          if (res.ok) {
            const text = await res.text();
            if (text && text.trim()) {
              const data: { data: Category[] } = JSON.parse(text);
              const topLevel = data.data?.filter((cat) => !cat.parent) || [];
              setCategories(topLevel);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch menu data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [variant]);

  // Render menu item link
  const renderMenuItem = (item: MenuItem) => {
    const href = item.tipus === 'kategoria' && item.kategoria
      ? `/kategoriak/${getSlugString(item.kategoria.slug)}`
      : item.url || '#';

    const isExternal = item.url?.startsWith('http');

    if (isExternal) {
      return (
        <a
          key={item._id}
          href={item.url}
          target={item.nyitasUjTabon ? '_blank' : undefined}
          rel={item.nyitasUjTabon ? 'noopener noreferrer' : undefined}
          className="flex items-center gap-2 text-gray-700 hover:text-[#FFBB36] font-medium transition-colors py-1"
        >
          {item.cim}
          {item.nyitasUjTabon && <ExternalLink className="h-3 w-3" />}
        </a>
      );
    }

    return (
      <Link
        key={item._id}
        href={href}
        className="flex items-center gap-2 text-gray-700 hover:text-[#FFBB36] font-medium transition-colors py-1"
      >
        {item.cim}
      </Link>
    );
  };

  // Render menu tree recursively
  const renderMenuTree = (items: MenuItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item._id} className={depth > 0 ? 'ml-4' : ''}>
        {renderMenuItem(item)}
        {item.children && item.children.length > 0 && (
          <div className="mt-1">
            {renderMenuTree(item.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Helper to get href from a menu item
  const getMenuItemHref = (item: MenuItem) => {
    if (item.tipus === 'kategoria' && item.kategoria) {
      return `/kategoriak/${getSlugString(item.kategoria.slug)}`;
    }
    return item.url || '#';
  };

  // Icon variant - wide rectangle dropdown with grid layout
  if (variant === 'icon') {
    const itemsWithChildren = menuItems.filter(
      (item) => item.children && item.children.length > 0
    );
    const simpleItems = menuItems.filter(
      (item) => !item.children || item.children.length === 0
    );

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          className="flex items-center justify-center w-[37px] h-[39px] hover:opacity-70 transition-opacity"
          aria-label="Menü"
          aria-expanded={isOpen}
        >
          <Image src="/icons/nav-icon.svg" alt="Menü" width={29} height={29} />
        </button>

        {/* Wide dropdown */}
        <div
          className={cn(
            'absolute left-0 top-full pt-2 z-50 transition-all duration-200',
            isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          )}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-[700px]">
            {/* Top row: info links */}
            <div className="flex items-center gap-1 pb-4 mb-5 border-b border-gray-100">
              {infoLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FFBB36] font-medium transition-colors text-sm"
                  >
                    <Icon className="h-4 w-4 text-gray-400" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full" />
              </div>
            ) : menuItems.length > 0 ? (
              <>
                {/* Sections with children — categories in a grid */}
                {itemsWithChildren.map((item) => (
                  <div key={item._id} className="mb-5 last:mb-0">
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        {item.cim}
                      </h3>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
                      {item.children!.map((child) => {
                        const href = getMenuItemHref(child);
                        const isExternal = child.url?.startsWith('http');
                        return isExternal ? (
                          <a
                            key={child._id}
                            href={child.url}
                            target={child.nyitasUjTabon ? '_blank' : undefined}
                            rel={child.nyitasUjTabon ? 'noopener noreferrer' : undefined}
                            className="text-[13px] text-gray-600 hover:text-[#FFBB36] py-1.5 px-2 rounded-md hover:bg-gray-50 transition-colors leading-snug"
                          >
                            {child.cim}
                          </a>
                        ) : (
                          <Link
                            key={child._id}
                            href={href}
                            className="text-[13px] text-gray-600 hover:text-[#FFBB36] py-1.5 px-2 rounded-md hover:bg-gray-50 transition-colors leading-snug"
                          >
                            {child.cim}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Simple items as a bottom row */}
                {simpleItems.length > 0 && (
                  <div className="flex items-center gap-1 pt-4 mt-4 border-t border-gray-100">
                    {simpleItems.map((item) => {
                      const href = getMenuItemHref(item);
                      const isExternal = item.url?.startsWith('http');
                      return isExternal ? (
                        <a
                          key={item._id}
                          href={item.url}
                          target={item.nyitasUjTabon ? '_blank' : undefined}
                          rel={item.nyitasUjTabon ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FFBB36] font-medium transition-colors"
                        >
                          {item.cim}
                          {item.nyitasUjTabon && <ExternalLink className="h-3 w-3" />}
                        </a>
                      ) : (
                        <Link
                          key={item._id}
                          href={href}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FFBB36] font-medium transition-colors"
                        >
                          {item.cim}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/termekek"
                className="flex items-center gap-2 text-gray-700 hover:text-[#FFBB36] font-medium transition-colors"
              >
                <Package className="h-4 w-4" />
                Termékek
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant - full mega menu with categories
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger button */}
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
            {infoLinks.map((link) => {
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
                {categories.map((category) => (
                  <div key={getSlugString(category.slug)}>
                    <Link
                      href={`/kategoriak/${getSlugString(category.slug)}`}
                      className="flex items-center gap-2 font-semibold text-secondary-900 hover:text-primary-500 transition-colors"
                    >
                      {categoryIcons[getSlugString(category.slug)]}
                      {category.name}
                    </Link>
                    {category.children && category.children.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {category.children.slice(0, 5).map((sub) => (
                          <li key={getSlugString(sub.slug)}>
                            <Link
                              href={`/kategoriak/${getSlugString(sub.slug)}`}
                              className="text-sm text-secondary-600 hover:text-primary-500 transition-colors block py-0.5"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                        {category.children.length > 5 && (
                          <li>
                            <Link
                              href={`/kategoriak/${getSlugString(category.slug)}`}
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
