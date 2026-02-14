'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronRight, Grid3X3, Flame, Home, Package, Users, Phone, ExternalLink } from 'lucide-react';
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

interface MegaMenuProps {
  variant?: 'default' | 'icon';
}

export function MegaMenu({ variant = 'default' }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [panelKey, setPanelKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          const res = await fetch(`${window.location.origin}/api/categories?tree=1`);
          if (res.ok) {
            const text = await res.text();
            if (text && text.trim()) {
              const data: { data: Category[] } = JSON.parse(text);
              setCategories(data.data || []);
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

  // Auto-select first category when menu opens
  useEffect(() => {
    if (isOpen && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]._id);
    }
  }, [isOpen, categories, activeCategory]);

  // Reset active category when menu closes
  useEffect(() => {
    if (!isOpen) {
      setActiveCategory(null);
    }
  }, [isOpen]);

  const handleCategoryHover = useCallback((categoryId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(categoryId);
      setPanelKey((k) => k + 1);
    }, 80);
  }, []);

  const activeCat = categories.find((c) => c._id === activeCategory);

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

  // Default variant - split-panel mega menu
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
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown menu */}
      <div
        className={cn(
          'absolute left-0 top-full pt-2 z-50 transition-[opacity,transform] duration-200 ease-out',
          isOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible pointer-events-none -translate-y-1'
        )}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden w-[720px]">
          {/* Top navigation links */}
          <div className="flex items-center gap-1 px-5 pt-4 pb-3 border-b border-gray-100">
            {infoLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-amber-500 font-medium transition-colors text-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-gray-400" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="flex min-h-[320px]">
              {/* Left panel - parent categories */}
              <div className="w-[220px] border-r border-gray-100 py-2 flex-shrink-0 bg-gray-50/50">
                {categories.map((category) => {
                  const isActive = activeCategory === category._id;
                  const hasChildren = category.children && category.children.length > 0;
                  return (
                    <div
                      key={category._id}
                      onMouseEnter={() => handleCategoryHover(category._id)}
                    >
                      <Link
                        href={`/kategoriak/${getSlugString(category.slug)}`}
                        className={cn(
                          'group flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-all duration-150 relative',
                          isActive
                            ? 'text-amber-600 bg-white'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-white/60',
                        )}
                      >
                        {/* Active indicator bar */}
                        <span
                          className={cn(
                            'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200',
                            isActive ? 'h-6 bg-amber-400' : 'h-0 bg-transparent',
                          )}
                        />
                        <Flame
                          className={cn(
                            'h-3.5 w-3.5 flex-shrink-0 transition-colors duration-150',
                            isActive ? 'text-amber-500' : 'text-gray-400 group-hover:text-gray-500',
                          )}
                        />
                        <span className="truncate flex-1">{category.name}</span>
                        {hasChildren && (
                          <ChevronRight
                            className={cn(
                              'h-3.5 w-3.5 flex-shrink-0 transition-all duration-150',
                              isActive
                                ? 'text-amber-400 translate-x-0.5'
                                : 'text-gray-300 group-hover:text-gray-400',
                            )}
                          />
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Right panel - children + grandchildren */}
              <div className="flex-1 p-5 overflow-y-auto">
                {activeCat ? (
                  <div key={panelKey} className="animate-mega-panel-in">
                    {/* Category header */}
                    <div className="mb-4">
                      <Link
                        href={`/kategoriak/${getSlugString(activeCat.slug)}`}
                        className="text-sm font-semibold text-gray-900 hover:text-amber-500 transition-colors"
                      >
                        {activeCat.name}
                      </Link>
                      {activeCat.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {activeCat.description}
                        </p>
                      )}
                    </div>

                    {activeCat.children && activeCat.children.length > 0 ? (
                      <div className="animate-stagger-children">
                        {/* Render children in columns */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          {activeCat.children.map((child) => (
                            <div key={child._id}>
                              <Link
                                href={`/kategoriak/${getSlugString(child.slug)}`}
                                className="group/sub flex items-center gap-1.5 text-[13px] font-semibold text-gray-800 hover:text-amber-500 transition-colors"
                              >
                                <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                                {child.name}
                                <ChevronRight className="h-3 w-3 text-gray-300 opacity-0 -translate-x-1 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all duration-150" />
                              </Link>

                              {/* Grandchildren */}
                              {child.children && child.children.length > 0 && (
                                <ul className="mt-1.5 ml-2.5 space-y-0.5 border-l border-gray-100 pl-2.5">
                                  {child.children.map((grandchild) => (
                                    <li key={grandchild._id}>
                                      <Link
                                        href={`/kategoriak/${getSlugString(grandchild.slug)}`}
                                        className="text-xs text-gray-500 hover:text-amber-500 transition-colors block py-0.5"
                                      >
                                        {grandchild.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                        <Link
                          href={`/kategoriak/${getSlugString(activeCat.slug)}`}
                          className="hover:text-amber-500 transition-colors"
                        >
                          Termékek megtekintése →
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-gray-400">
                    Válasszon kategóriát
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom bar */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Nem találja amit keres?
            </p>
            <Link
              href="/kategoriak"
              className="text-xs font-medium text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1"
            >
              Összes kategória
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
