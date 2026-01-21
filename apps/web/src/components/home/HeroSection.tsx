import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  backgroundImage?: string;
}

export function HeroSection({ backgroundImage }: HeroSectionProps) {
  const t = useTranslations('home.hero');

  return (
    <section className="relative bg-gradient-to-r from-secondary-100 to-secondary-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[500px] lg:min-h-[550px] py-12 lg:py-16">
          {/* Content */}
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-full mb-6">
              <ShieldCheck className="h-4 w-4" />
              CE Tanúsított termékek
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight mb-6">
              {t('title')}{' '}
              <span className="text-primary-500">{t('titleHighlight', { defaultValue: 'Megoldások' })}</span>
            </h1>
            <p className="text-lg text-secondary-600 mb-8 leading-relaxed">
              {t('subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2 rounded-full">
                <Link href="/termekek">
                  {t('cta')}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link href="/ajanlatkeres">
                  Árajánlat kérés
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-secondary-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-900">500+</div>
                <div className="text-sm text-secondary-600">Termék</div>
              </div>
              <div className="h-10 w-px bg-secondary-200" />
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-900">10+</div>
                <div className="text-sm text-secondary-600">Év tapasztalat</div>
              </div>
              <div className="h-10 w-px bg-secondary-200" />
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-900">1000+</div>
                <div className="text-sm text-secondary-600">Elégedett ügyfél</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square max-w-lg ml-auto">
              {backgroundImage ? (
                <Image
                  src={backgroundImage}
                  alt="Tűzvédelmi termékek"
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center relative overflow-hidden">
                  {/* Fire extinguisher illustration */}
                  <div className="text-center relative z-10">
                    <div className="text-8xl mb-4">🧯</div>
                    <p className="text-secondary-700 font-medium text-lg">Professzionális felszerelés</p>
                    <p className="text-secondary-500 text-sm mt-1">minden igényre</p>
                  </div>
                  {/* Decorative circles */}
                  <div className="absolute top-8 right-8 w-20 h-20 bg-primary-300/30 rounded-full" />
                  <div className="absolute bottom-12 left-12 w-16 h-16 bg-primary-400/20 rounded-full" />
                </div>
              )}
            </div>

            {/* Floating badge */}
            <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg p-4 animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-secondary-900 text-sm">Garancia</p>
                  <p className="text-xs text-secondary-500">Minőségre</p>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-500 rounded-full opacity-20" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary-400 rounded-full opacity-10" />
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-50 to-transparent opacity-50" />
    </section>
  );
}
