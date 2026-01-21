import { Link } from '@/i18n/navigation';
import { ArrowRight, Flame, Shield } from 'lucide-react';

interface PromoBanner {
  title: string;
  subtitle: string;
  discount?: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
  icon?: React.ReactNode;
}

const defaultBanners: PromoBanner[] = [
  {
    title: 'Poroltó készülékek',
    subtitle: 'Teljes kínálat egy helyen',
    discount: '20% kedvezmény',
    ctaText: 'Vásárlás most',
    ctaLink: '/kategoriak/porolto-keszulekek',
    bgColor: 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700',
    icon: <Flame className="h-16 w-16" />,
  },
  {
    title: 'Tűzjelző rendszerek',
    subtitle: 'Professzionális megoldások',
    discount: '15% kedvezmény',
    ctaText: 'Vásárlás most',
    ctaLink: '/kategoriak/tuzjelzo-rendszerek',
    bgColor: 'bg-gradient-to-br from-secondary-800 via-secondary-900 to-secondary-950',
    icon: <Shield className="h-16 w-16" />,
  },
];

interface PromoBannersProps {
  banners?: PromoBanner[];
}

export function PromoBanners({ banners = defaultBanners }: PromoBannersProps) {
  return (
    <section className="py-10 lg:py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          {banners.map((banner, index) => (
            <Link
              key={index}
              href={banner.ctaLink}
              className={`
                relative overflow-hidden rounded-2xl p-8 lg:p-10 min-h-[220px]
                flex items-center group text-white
                ${banner.bgColor}
              `}
            >
              {/* Content */}
              <div className="relative z-10 max-w-sm">
                {banner.discount && (
                  <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
                    {banner.discount}
                  </span>
                )}
                <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                  {banner.title}
                </h3>
                <p className="text-white/80 mb-5 text-lg">
                  {banner.subtitle}
                </p>
                <span className="inline-flex items-center gap-2 font-semibold text-lg group-hover:gap-4 transition-all duration-300">
                  {banner.ctaText}
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>

              {/* Icon decoration */}
              {banner.icon && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 group-hover:text-white/20 transition-colors duration-300">
                  {banner.icon}
                </div>
              )}

              {/* Decorative circles */}
              <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-white/5 rounded-full transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/5 rounded-full transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute -left-16 -top-16 w-40 h-40 bg-white/5 rounded-full" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
