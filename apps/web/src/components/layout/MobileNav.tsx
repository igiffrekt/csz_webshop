'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Home,
  Phone,
  FileText,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import type { Category } from '@csz/types';

const mainLinks = [
  { href: '/', label: 'Címlap', icon: Home },
  { href: '/rolunk', label: 'Rólunk', icon: FileText },
  { href: '/kapcsolat', label: 'Kapcsolat', icon: Phone },
] as const;

function CategoryItem({ category, depth = 0, onNavigate }: { category: Category; depth?: number; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div className="flex items-center">
        <SheetClose asChild>
          <Link
            href={`/kategoriak/${category.slug}`}
            onClick={onNavigate}
            className={cn(
              'flex-1 flex items-center gap-2 py-2.5 px-2 rounded-md hover:bg-gray-50 transition-colors leading-snug',
              depth === 0 && 'text-[13px] text-gray-700 font-medium',
              depth === 1 && 'text-[13px] text-gray-600 pl-5',
              depth === 2 && 'text-xs text-gray-500 pl-9',
            )}
          >
            {depth === 0 && <Flame className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />}
            {depth === 1 && <span className="w-1 h-1 rounded-full bg-amber-300 flex-shrink-0" />}
            <span>{category.name}</span>
          </Link>
        </SheetClose>
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2.5 text-gray-400 hover:text-gray-600 active:scale-90 transition-all"
            aria-label={expanded ? 'Bezárás' : 'Megnyitás'}
            aria-expanded={expanded}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', expanded && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Animated accordion content */}
      {hasChildren && (
        <div className="accordion-content" data-open={expanded}>
          <div className="accordion-inner">
            {depth === 0 && <div className="ml-4 border-l-2 border-amber-100 pl-0">
              {category.children!.map((child) => (
                <CategoryItem key={child._id} category={child} depth={depth + 1} onNavigate={onNavigate} />
              ))}
            </div>}
            {depth > 0 && (
              <div>
                {category.children!.map((child) => (
                  <CategoryItem key={child._id} category={child} depth={depth + 1} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function MobileNav() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menü megnyitása</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="p-0 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
          <SheetTitle>
            <Logo />
          </SheetTitle>
          <SheetDescription className="sr-only">Navigációs menü</SheetDescription>
        </SheetHeader>

        <div className="px-5 py-5">
          {/* Main navigation — horizontal row */}
          <nav className="flex items-center gap-1 pb-4 mb-4 border-b border-gray-100">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              return (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#FFBB36] font-medium transition-colors text-sm"
                  >
                    <Icon className="h-4 w-4 text-gray-400" />
                    {link.label}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>

          {/* Categories section — expandable tree */}
          {categories.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3 px-1">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Kategóriák
                </h3>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-0">
                {categories.map((category) => (
                  <CategoryItem
                    key={category._id}
                    category={category}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </div>

              <SheetClose asChild>
                <Link
                  href="/kategoriak"
                  className="inline-flex items-center gap-1 mt-3 px-2 text-sm font-medium text-[#FFBB36] hover:text-amber-600 transition-colors"
                >
                  Összes kategória
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </SheetClose>
            </div>
          )}

          {/* Bottom promo bar */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-500">
              <p className="font-medium text-[#FFBB36]">
                Ingyenes szállítás 50.000 Ft felett!
              </p>
              <p>
                Kérdése van?{' '}
                <a href="tel:+3612345678" className="font-medium text-gray-700">
                  +36 1 234 5678
                </a>
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
