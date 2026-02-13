'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { MoveRight, PhoneCall, ChevronRight, Flame, Bell, Shield, Wrench, Package, Tag, Star, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/formatters';
import type { Category } from '@csz/types';

interface HeroProduct {
  _id: string;
  name: string;
  slug: string;
  basePrice: number;
  images?: { url: string }[];
  categories?: { name: string; slug: string }[];
}

interface HeroCategory {
  name: string;
  slug: string;
  children?: { name: string; slug: string }[];
}

interface HeroData {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroSectionProps {
  products?: HeroProduct[];
  categories?: HeroCategory[];
  heroData?: HeroData;
}

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

export function HeroSection({ products = [], heroData }: HeroSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  // Get up to 3 products for the image grid
  const gridProducts = products.slice(0, 3);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${window.location.origin}/api/categories`);
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim()) {
            const data: { data: Category[] } = JSON.parse(text);
            const topLevel = data.data?.filter((cat) => !cat.parent) || [];
            setCategories(topLevel);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }

    fetchCategories();
  }, []);

  // Use API categories if available, otherwise fallback
  const displayCategories = categories.length > 0
    ? categories.map((cat) => ({
        name: cat.name,
        slug: `kategoriak/${cat.slug}`,
        icon: <Package className="h-4 w-4" />,
        highlight: false,
      }))
    : sidebarCategories;

  return (
    <section className="w-full py-8 lg:py-12">
      <div className="site-container">
        <div className="flex gap-6">
          {/* Left sidebar - Category menu (desktop only) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <ul className="py-2">
                {displayCategories.slice(0, 10).map((cat, index) => (
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
            <div className="grid grid-cols-1 gap-8 items-center md:grid-cols-2">
              {/* Left content */}
              <div className="flex gap-4 flex-col">
                <div>
                  <Badge variant="outline">Professzionális tűzvédelem</Badge>
                </div>
                <div className="flex gap-4 flex-col">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl max-w-lg tracking-tighter text-left font-regular">
                    {heroData?.title || 'Biztonság, amiben megbízhat!'}
                  </h1>
                  <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-md text-left">
                    {heroData?.subtitle || 'Professzionális tűzvédelmi eszközök és megoldások otthonára és vállalkozására. Minőségi termékek, szakértői tanácsadás és gyors kiszállítás országszerte.'}
                  </p>
                </div>
                <div className="flex flex-row gap-4 flex-wrap">
                  <Button size="lg" className="gap-4" variant="outline" asChild>
                    <Link href="/kapcsolat">
                      Kérjen ajánlatot <PhoneCall className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="lg" className="gap-4" asChild>
                    <Link href={heroData?.ctaLink || '/termekek'}>
                      {heroData?.ctaText || 'Termékek böngészése'} <MoveRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right image grid */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                {/* Top left - square */}
                <div className="bg-muted rounded-[20px] aspect-square overflow-hidden">
                  {gridProducts[0]?.images?.[0] ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={getImageUrl(gridProducts[0].images[0].url)}
                        alt={gridProducts[0].name}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">🧯</span>
                    </div>
                  )}
                </div>

                {/* Right - tall, spans 2 rows */}
                <div className="bg-muted rounded-[20px] row-span-2 overflow-hidden">
                  {gridProducts[1]?.images?.[0] ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={getImageUrl(gridProducts[1].images[0].url)}
                        alt={gridProducts[1].name}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">🔥</span>
                    </div>
                  )}
                </div>

                {/* Bottom left - square */}
                <div className="bg-muted rounded-[20px] aspect-square overflow-hidden">
                  {gridProducts[2]?.images?.[0] ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={getImageUrl(gridProducts[2].images[0].url)}
                        alt={gridProducts[2].name}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">🚒</span>
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
