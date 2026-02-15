'use client';

import { Link } from '@/i18n/navigation';
import { PenLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { HeroCategorySidebar } from './HeroCategorySidebar';

interface HeroData {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroSectionProps {
  products?: unknown[];
  categories?: unknown[];
  heroData?: HeroData;
}

export function HeroSection({ heroData }: HeroSectionProps) {
  return (
    <section className="w-full py-8 lg:py-12">
      <div className="site-container">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Left sidebar — 1/3 width on desktop */}
          <div className="hidden lg:block lg:w-1/3 flex-shrink-0">
            <HeroCategorySidebar />
          </div>

          {/* Hero content — 2/3 width on desktop */}
          <div className="flex-1 lg:w-2/3 flex flex-col justify-center gap-5">
            <div>
              <Badge variant="outline">Professzionális tűzvédelem</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tighter text-left font-regular">
              {heroData?.title || 'Biztonság, amiben megbízhat!'}
            </h1>
            <p className="text-lg leading-relaxed tracking-tight text-muted-foreground text-left">
              {heroData?.subtitle || 'Professzionális tűzvédelmi eszközök és megoldások otthonára és vállalkozására. Minőségi termékek, szakértői tanácsadás és gyors kiszállítás országszerte.'}
            </p>
            <div className="flex flex-row gap-4 flex-wrap pt-2">
              <Link href="/kapcsolat">
                <InteractiveHoverButton
                  text="Kérjen ajánlatot"
                  icon={PenLine}
                  className="w-48 h-12 text-sm"
                />
              </Link>
              <Link href={heroData?.ctaLink || '/termekek'}>
                <InteractiveHoverButton
                  text={heroData?.ctaText || 'Termékek böngészése'}
                  variant="filled"
                  className="w-52 h-12 text-sm"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
