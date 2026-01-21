import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

interface PromoBanner {
  title: string;
  subtitle: string;
  discount: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
  textColor: string;
  buttonBg: string;
}

const defaultBanners: PromoBanner[] = [
  {
    discount: '20% kedvezmény',
    title: 'Legújabb poroltó készülékek',
    subtitle: 'Professzionális megoldások minden igényre, CE tanúsítvánnyal.',
    ctaText: 'Vásárlás',
    ctaLink: '/kategoriak/porolto',
    bgColor: 'bg-gradient-to-br from-green-600 to-green-700',
    textColor: 'text-white',
    buttonBg: 'bg-amber-400 hover:bg-amber-500 text-gray-900',
  },
  {
    discount: '15% kedvezmény',
    title: 'Tűzjelző rendszer kollekció',
    subtitle: 'Biztonságos otthon és munkahely érzékelőkkel.',
    ctaText: 'Vásárlás',
    ctaLink: '/kategoriak/tuzjelzo-rendszerek',
    bgColor: 'bg-gradient-to-br from-amber-100 to-amber-200',
    textColor: 'text-gray-900',
    buttonBg: 'bg-amber-400 hover:bg-amber-500 text-gray-900',
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
                relative overflow-hidden rounded-2xl p-8 lg:p-10 min-h-[240px]
                flex items-center group
                ${banner.bgColor} ${banner.textColor}
              `}
            >
              {/* Content */}
              <div className="relative z-10 max-w-[65%]">
                <span className={`inline-block px-3 py-1 ${index === 0 ? 'bg-white/20' : 'bg-amber-400/50'} rounded-full text-xs font-semibold mb-4`}>
                  {banner.discount}
                </span>
                <h3 className="text-xl lg:text-2xl font-bold mb-2 leading-tight">
                  {banner.title}
                </h3>
                <p className={`${index === 0 ? 'text-white/80' : 'text-gray-600'} mb-5 text-sm`}>
                  {banner.subtitle}
                </p>
                <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm ${banner.buttonBg} transition-all duration-300`}>
                  {banner.ctaText}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>

              {/* Decorative image placeholder */}
              <div className="absolute right-4 bottom-4 w-32 h-32 lg:w-40 lg:h-40 flex items-center justify-center opacity-80">
                <span className="text-7xl lg:text-8xl">
                  {index === 0 ? '🧯' : '🔔'}
                </span>
              </div>

              {/* Decorative circles */}
              <div className={`absolute -right-10 -bottom-10 w-48 h-48 ${index === 0 ? 'bg-white/5' : 'bg-amber-300/30'} rounded-full`} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
