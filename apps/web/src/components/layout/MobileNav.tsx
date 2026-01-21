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
  Grid3X3,
  Tag,
  Phone,
  HelpCircle,
  FileText,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import type { Category, StrapiListResponse } from '@csz/types';

const mainLinks = [
  { href: '/', labelKey: 'home', icon: Home },
  { href: '/termekek', labelKey: 'products', icon: Grid3X3 },
  { href: '/termekek?onSale=true', label: 'Akciók', icon: Tag },
  { href: '/ajanlatkeres', label: 'Árajánlat', icon: FileText },
  { href: '/kapcsolat', labelKey: 'contact', icon: Phone },
  { href: '/gyik', labelKey: 'faq', icon: HelpCircle },
] as const;

export function MobileNav() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data: StrapiListResponse<Category> = await res.json();
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

  const toggleCategory = (slug: string) => {
    setExpandedCategory(expandedCategory === slug ? null : slug);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menü megnyitása</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
          {/* Main navigation */}
          <nav className="flex flex-col p-4">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              return (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 py-3 text-secondary-900 hover:text-primary-500 transition-colors border-b border-secondary-100"
                  >
                    <Icon className="h-5 w-5 text-secondary-500" />
                    <span className="font-medium">
                      {'labelKey' in link ? t(link.labelKey) : link.label}
                    </span>
                  </Link>
                </SheetClose>
              );
            })}
          </nav>

          {/* Categories section */}
          <div className="px-4 pb-4">
            <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
              Kategóriák
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <div key={category.slug} className="border-b border-secondary-100">
                  <button
                    onClick={() => toggleCategory(category.slug)}
                    className="flex items-center justify-between w-full py-3 text-left text-secondary-900 hover:text-primary-500 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-primary-500" />
                      {category.name}
                    </span>
                    {category.children && category.children.length > 0 && (
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-secondary-400 transition-transform',
                          expandedCategory === category.slug && 'rotate-180'
                        )}
                      />
                    )}
                  </button>

                  {/* Subcategories */}
                  {expandedCategory === category.slug &&
                    category.children &&
                    category.children.length > 0 && (
                      <div className="pl-6 pb-2 space-y-1">
                        <SheetClose asChild>
                          <Link
                            href={`/kategoriak/${category.slug}`}
                            className="flex items-center gap-2 py-2 text-sm text-secondary-600 hover:text-primary-500"
                          >
                            <ChevronRight className="h-3 w-3" />
                            Összes {category.name}
                          </Link>
                        </SheetClose>
                        {category.children.map((sub) => (
                          <SheetClose asChild key={sub.slug}>
                            <Link
                              href={`/kategoriak/${sub.slug}`}
                              className="flex items-center gap-2 py-2 text-sm text-secondary-600 hover:text-primary-500"
                            >
                              <ChevronRight className="h-3 w-3" />
                              {sub.name}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    )}
                </div>
              ))}

              <SheetClose asChild>
                <Link
                  href="/kategoriak"
                  className="flex items-center justify-center gap-2 py-3 mt-2 text-sm font-medium text-primary-500 hover:text-primary-600 bg-primary-50 rounded-lg"
                >
                  Összes kategória
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </SheetClose>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-auto p-4 border-t bg-secondary-50">
            <div className="text-center text-sm text-secondary-600">
              <p className="font-medium text-primary-500">
                Ingyenes szállítás 50.000 Ft felett!
              </p>
              <p className="mt-1">
                Kérdése van? Hívjon:{' '}
                <a href="tel:+3612345678" className="font-medium text-secondary-900">
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
