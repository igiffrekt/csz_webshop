'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  Menu,
  X,
  ChevronRight,
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

export function MobileNav() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data: { data: Category[] } = await res.json();
          const topLevel = data.data.filter((cat) => !cat.parent);
          setCategories(topLevel);
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

          {/* Categories section — grid */}
          {categories.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3 px-1">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Kategóriák
                </h3>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {categories.map((category) => (
                  <SheetClose asChild key={category.slug}>
                    <Link
                      href={`/kategoriak/${category.slug}`}
                      className="flex items-center gap-2 text-[13px] text-gray-600 hover:text-[#FFBB36] py-2 px-2 rounded-md hover:bg-gray-50 transition-colors leading-snug"
                    >
                      <Flame className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                      <span>{category.name}</span>
                    </Link>
                  </SheetClose>
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
