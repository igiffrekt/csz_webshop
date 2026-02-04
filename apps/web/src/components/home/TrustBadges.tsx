import { Truck, Wallet, Headphones } from 'lucide-react';

const badges = [
  {
    icon: Truck,
    title: 'Ingyenes szállítás',
    description: '50.000 Ft feletti rendelés esetén',
  },
  {
    icon: Wallet,
    title: 'Rugalmas fizetés',
    description: 'Többféle fizetési lehetőség',
  },
  {
    icon: Headphones,
    title: '24/7 Ügyfélszolgálat',
    description: 'Támogatjuk Önt bármikor',
  },
];

export function TrustBadges() {
  return (
    <section className="bg-white border-y border-gray-100">
      <div className="site-container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-12 py-6 lg:py-8">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.title}
                className="flex items-center gap-4 justify-center"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center">
                  <Icon className="h-6 w-6 text-gray-900" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {badge.title}
                  </h3>
                  <p className="text-gray-500 text-xs">
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
