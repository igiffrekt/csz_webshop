'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Flame,
  Bell,
  Shield,
  Wrench,
  Package,
  Tag,
  Star,
  Percent,
  ChevronRight
} from 'lucide-react';
import type { Category, StrapiListResponse } from '@csz/types';

interface HeroSectionProps {
  backgroundImage?: string;
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'napi-ajanlat': <Tag className="h-4 w-4" />,
  'top-100': <Star className="h-4 w-4" />,
  'uj-termekek': <Package className="h-4 w-4" />,
  'tuzolto-keszulekek': <Flame className="h-4 w-4" />,
  'tuzjelzo-rendszerek': <Bell className="h-4 w-4" />,
  'vedofelszerelesek': <Shield className="h-4 w-4" />,
  'kiegeszitok': <Wrench className="h-4 w-4" />,
};

// Fallback categories for sidebar
const sidebarCategories = [
  { name: 'Napi ajánlat', slug: 'termekek?deal=true', icon: <Percent className="h-4 w-4 text-amber-500" />, highlight: true },
  { name: 'Top 100 ajánlat', slug: 'termekek?top=true', icon: <Star className="h-4 w-4" /> },
  { name: 'Új termékek', slug: 'termekek?new=true', icon: <Package className="h-4 w-4" /> },
  { name: 'Tűzoltó készülékek', slug: 'kategoriak/tuzolto-keszulekek', icon: <Flame className="h-4 w-4" /> },
  { name: 'Tűzjelző rendszerek', slug: 'kategoriak/tuzjelzo-rendszerek', icon: <Bell className="h-4 w-4" /> },
  { name: 'Védőfelszerelések', slug: 'kategoriak/vedofelszerelesek', icon: <Shield className="h-4 w-4" /> },
  { name: 'Kiegészítők', slug: 'kategoriak/kiegeszitok', icon: <Wrench className="h-4 w-4" /> },
  { name: 'Tartók és állványok', slug: 'kategoriak/tartok', icon: <Package className="h-4 w-4" /> },
  { name: 'Jelzőtáblák', slug: 'kategoriak/jelzotablak', icon: <Tag className="h-4 w-4" /> },
  { name: 'Akciós termékek', slug: 'termekek?onSale=true', icon: <Percent className="h-4 w-4 text-red-500" />, highlight: true },
];

export function HeroSection({ backgroundImage }: HeroSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);

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

    fetchCategories();
  }, []);

  return (
    <section className="bg-gradient-to-br from-green-50 via-yellow-50 to-amber-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left sidebar - Category menu (desktop only) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <ul className="py-2">
                {sidebarCategories.map((cat, index) => (
                  <li key={index}>
                    <Link
                      href={`/${cat.slug}`}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-amber-50 ${
                        cat.highlight
                          ? 'text-amber-600 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="text-gray-500">{cat.icon}</span>
                      <span className="flex-1">{cat.name}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main hero content */}
          <div className="flex-1">
            <div className="relative bg-gradient-to-r from-green-100 to-lime-50 rounded-2xl overflow-hidden min-h-[400px] lg:min-h-[460px]">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-64 h-64 bg-green-500 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-yellow-400 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10 grid lg:grid-cols-2 gap-8 h-full p-8 lg:p-12">
                {/* Text content */}
                <div className="flex flex-col justify-center">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-gray-900 text-xs font-semibold rounded-full w-fit mb-4">
                    Új kollekció
                  </span>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                    Professzionális
                    <br />
                    <span className="text-green-600">Tűzvédelem.</span>
                  </h1>
                  <p className="text-gray-600 mb-2">
                    Akár <span className="font-bold text-2xl text-gray-900">30%</span> kedvezmény
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mb-6">
                    69.990 Ft-tól
                  </p>
                  <div className="flex gap-3">
                    <Button
                      asChild
                      className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold rounded-md px-6"
                    >
                      <Link href="/termekek">
                        Vásárlás
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-gray-300 hover:bg-white/50 rounded-md"
                    >
                      <Link href="/kategoriak">
                        Kategóriák
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Image */}
                <div className="relative hidden lg:flex items-center justify-center">
                  {backgroundImage ? (
                    <Image
                      src={backgroundImage}
                      alt="Tűzvédelmi termékek"
                      fill
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="relative">
                      {/* Product showcase */}
                      <div className="w-72 h-72 bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <div className="text-center">
                          <div className="text-8xl">🧯</div>
                          <p className="text-gray-700 font-medium mt-2">Minőségi termékek</p>
                        </div>
                      </div>
                      {/* Floating badges */}
                      <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg px-3 py-2">
                        <p className="text-xs text-gray-500">Garancia</p>
                        <p className="font-bold text-green-600">2 év</p>
                      </div>
                      <div className="absolute -bottom-4 -left-4 bg-amber-400 rounded-lg px-3 py-2">
                        <p className="text-xs text-gray-800">Kedvezmény</p>
                        <p className="font-bold text-gray-900">-30%</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
