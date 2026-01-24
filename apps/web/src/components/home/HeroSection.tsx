import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { MoveRight, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStrapiMediaUrl } from '@/lib/formatters';

interface HeroProduct {
  documentId: string;
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

interface HeroSectionProps {
  products?: HeroProduct[];
  categories?: HeroCategory[];
}

export function HeroSection({ products = [] }: HeroSectionProps) {
  // Get up to 3 products for the image grid
  const gridProducts = products.slice(0, 3);

  return (
    <section className="w-full py-12 lg:py-20">
      <div className="site-container">
        <div className="grid grid-cols-1 gap-8 items-center md:grid-cols-2">
          {/* Left content */}
          <div className="flex gap-4 flex-col">
            <div>
              <Badge variant="outline">Professzionális tűzvédelem</Badge>
            </div>
            <div className="flex gap-4 flex-col">
              <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-lg tracking-tighter text-left font-regular">
                Biztonság, amiben megbízhat!
              </h1>
              <p className="text-xl leading-relaxed tracking-tight text-muted-foreground max-w-md text-left">
                Professzionális tűzvédelmi eszközök és megoldások otthonára és
                vállalkozására. Minőségi termékek, szakértői tanácsadás és gyors
                kiszállítás országszerte.
              </p>
            </div>
            <div className="flex flex-row gap-4">
              <Button size="lg" className="gap-4" variant="outline" asChild>
                <Link href="/kapcsolat">
                  Kérjen ajánlatot <PhoneCall className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" className="gap-4" asChild>
                <Link href="/termekek">
                  Termékek böngészése <MoveRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right image grid */}
          <div className="grid grid-cols-2 gap-8">
            {/* Top left - square */}
            <div className="bg-muted rounded-[20px] aspect-square overflow-hidden">
              {gridProducts[0]?.images?.[0] ? (
                <div className="relative w-full h-full">
                  <Image
                    src={getStrapiMediaUrl(gridProducts[0].images[0].url)}
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
                    src={getStrapiMediaUrl(gridProducts[1].images[0].url)}
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
                    src={getStrapiMediaUrl(gridProducts[2].images[0].url)}
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
    </section>
  );
}
