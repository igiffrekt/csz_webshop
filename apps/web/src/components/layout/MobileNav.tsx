'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import {
  ChevronRight,
  ChevronLeft,
  Home,
  Phone,
  FileText,
  Flame,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import type { Category } from '@csz/types';

/* ─── Static data ─── */

const mainLinks = [
  { href: '/' as const, label: 'Címlap', icon: Home },
  { href: '/rolunk' as const, label: 'Rólunk', icon: FileText },
  { href: '/kapcsolat' as const, label: 'Kapcsolat', icon: Phone },
] as const;

/* ─── Navigation state ─── */

type NavView = 'main' | 'category';

interface NavigationState {
  view: NavView;
  activeCategoryId: string | null;
  history: Array<{ view: NavView; categoryId: string | null }>;
  direction: 'forward' | 'back';
}

const initialNavState: NavigationState = {
  view: 'main',
  activeCategoryId: null,
  history: [],
  direction: 'forward',
};

/* ─── Helper: find category by id in tree ─── */

function findCategory(categories: Category[], id: string): Category | undefined {
  for (const cat of categories) {
    if (cat._id === id) return cat;
    if (cat.children) {
      const found = findCategory(cat.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

/* ─── Component ─── */

export function MobileNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [navState, setNavState] = useState<NavigationState>(initialNavState);

  // Fetch categories when menu opens
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories?tree=1');
        if (res.ok) {
          const data: { data: Category[] } = await res.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Reset nav state when menu closes
  useEffect(() => {
    if (!open) {
      // Small delay so the close animation finishes before resetting
      const timer = setTimeout(() => setNavState(initialNavState), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    router.push(href as any);
  }, [router]);

  const drillInto = useCallback((categoryId: string) => {
    setNavState((prev) => ({
      view: 'category',
      activeCategoryId: categoryId,
      history: [...prev.history, { view: prev.view, categoryId: prev.activeCategoryId }],
      direction: 'forward',
    }));
  }, []);

  const goBack = useCallback(() => {
    setNavState((prev) => {
      const history = [...prev.history];
      const last = history.pop();
      if (!last) return { ...initialNavState, direction: 'back' };
      return {
        view: last.view,
        activeCategoryId: last.categoryId,
        history,
        direction: 'back',
      };
    });
  }, []);

  const activeCategory = navState.activeCategoryId
    ? findCategory(categories, navState.activeCategoryId)
    : null;

  const isMain = navState.view === 'main';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menü megnyitása">
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className="text-gray-800">
            <rect y="0" width="20" height="2.5" rx="1.25" fill="currentColor" />
            <rect y="11.5" width="14" height="2.5" rx="1.25" fill="currentColor" />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="p-0 w-full sm:max-w-md flex flex-col"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigációs menü</SheetTitle>
          <SheetDescription>Kategóriák és oldalak böngészése</SheetDescription>
        </SheetHeader>

        {/* Panels container — clip overflow for slide transitions */}
        <div className="relative flex-1 overflow-hidden">
          {/* ═══ Main Panel ═══ */}
          <div
            className={cn(
              'absolute inset-0 flex flex-col nav-panel',
              isMain ? 'translate-x-0' : '-translate-x-full',
            )}
            aria-hidden={!isMain}
          >
            {/* Logo header */}
            <div className="flex items-center px-5 pt-5 pb-4 border-b border-gray-100">
              <Logo />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Main nav links */}
              <nav
                className={cn(
                  'flex items-center gap-1 pb-4 mb-4 border-b border-gray-100',
                  isMain && open && 'animate-stagger-children',
                )}
              >
                {mainLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.href}
                      onClick={() => navigate(link.href)}
                      className="flex items-center justify-center gap-2 flex-1 px-2 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#D4960A] font-semibold transition-colors text-base"
                    >
                      <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      {link.label}
                    </button>
                  );
                })}
              </nav>

              {/* Categories section */}
              {categories.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Kategóriák
                    </h3>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div
                    className={cn(
                      'flex flex-col gap-0.5',
                      isMain && open && 'animate-stagger-children',
                    )}
                  >
                    {categories.map((category) => (
                      <CategoryButton
                        key={category._id}
                        category={category}
                        depth={0}
                        onDrill={drillInto}
                        onNavigate={navigate}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/kategoriak')}
                    className="inline-flex items-center gap-1 mt-3 px-2 text-sm font-medium text-[#D4960A] hover:text-amber-600 transition-colors"
                  >
                    Összes kategória
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom promo bar */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/80">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5 font-medium text-[#D4960A]">
                  <Truck className="h-3.5 w-3.5" />
                  Ingyenes szállítás 50.000 Ft+
                </span>
                <a
                  href="tel:+3633506690"
                  className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  +36 33 506 690
                </a>
              </div>
            </div>
          </div>

          {/* ═══ Category Panel ═══ */}
          <div
            className={cn(
              'absolute inset-0 flex flex-col nav-panel',
              !isMain ? 'translate-x-0' : 'translate-x-full',
            )}
            aria-hidden={isMain}
          >
            {/* Back header */}
            <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-gray-100">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors p-1 -ml-1 rounded-md"
                aria-label="Vissza"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Vissza</span>
              </button>
              {activeCategory && (
                <h2 className="font-semibold text-gray-900 text-sm truncate">
                  {activeCategory.name}
                </h2>
              )}
            </div>

            {/* Scrollable category content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {activeCategory && (
                <>
                  {/* View all CTA */}
                  <button
                    onClick={() => navigate(`/kategoriak/${activeCategory.slug}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-4 rounded-lg bg-amber-50 text-amber-700 font-medium text-sm hover:bg-amber-100 transition-colors border border-amber-200/60"
                  >
                    Összes termék megtekintése
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Subcategories */}
                  {activeCategory.children && activeCategory.children.length > 0 && (
                    <div
                      className={cn(
                        'flex flex-col gap-0.5',
                        !isMain && open && 'animate-stagger-children',
                      )}
                    >
                      {activeCategory.children.map((child) => (
                        <CategoryButton
                          key={child._id}
                          category={child}
                          depth={1}
                          onDrill={drillInto}
                          onNavigate={navigate}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Category button ─── */

function CategoryButton({
  category,
  depth,
  onDrill,
  onNavigate,
}: {
  category: Category;
  depth: number;
  onDrill: (id: string) => void;
  onNavigate: (href: string) => void;
}) {
  const hasChildren = category.children && category.children.length > 0;

  if (hasChildren) {
    return (
      <button
        onClick={() => onDrill(category._id)}
        className={cn(
          'flex items-center justify-between w-full px-3 rounded-lg hover:bg-gray-50 transition-colors text-left',
          depth === 0 && 'py-2.5 text-[15px] text-gray-700 font-medium',
          depth >= 1 && 'py-3.5 text-[15px] text-gray-600',
        )}
      >
        <span className="flex items-center gap-2.5">
          {depth === 0 && <Flame className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />}
          {depth >= 1 && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 flex-shrink-0" />}
          <span>{category.name}</span>
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </button>
    );
  }

  return (
    <button
      onClick={() => onNavigate(`/kategoriak/${category.slug}`)}
      className={cn(
        'flex items-center w-full px-3 rounded-lg hover:bg-gray-50 transition-colors text-left',
        depth === 0 && 'py-2.5 text-[13px] text-gray-700 font-medium',
        depth >= 1 && 'py-3.5 text-[15px] text-gray-600',
      )}
    >
      <span className="flex items-center gap-2.5">
        {depth === 0 && <Flame className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />}
        {depth >= 1 && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 flex-shrink-0" />}
        <span>{category.name}</span>
      </span>
    </button>
  );
}
