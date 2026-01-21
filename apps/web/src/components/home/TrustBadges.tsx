import { Truck, CreditCard, Headphones, ShieldCheck, RotateCcw } from 'lucide-react';

const badges = [
  {
    icon: Truck,
    title: 'Ingyenes szállítás',
    description: '50.000 Ft felett',
  },
  {
    icon: CreditCard,
    title: 'Biztonságos fizetés',
    description: 'Stripe és bankkártya',
  },
  {
    icon: Headphones,
    title: 'Szakértő támogatás',
    description: 'Hétfő-Péntek 8-17',
  },
  {
    icon: ShieldCheck,
    title: 'CE tanúsított',
    description: 'Minőségi termékek',
  },
];

export function TrustBadges() {
  return (
    <section className="border-y border-secondary-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 py-8 lg:py-10">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.title}
                className="flex items-center gap-4 justify-center lg:justify-start"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900 text-sm lg:text-base">
                    {badge.title}
                  </h3>
                  <p className="text-secondary-500 text-xs lg:text-sm">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
