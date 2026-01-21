import { Truck, Wallet, Headphones, ShieldCheck } from 'lucide-react';

const badges = [
  {
    icon: Truck,
    title: 'Ingyenes szállítás',
    description: '50.000 Ft feletti rendelés esetén',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    icon: Wallet,
    title: 'Rugalmas fizetés',
    description: 'Többféle fizetési lehetőség',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    icon: Headphones,
    title: '24/7 Ügyfélszolgálat',
    description: 'Támogatjuk Önt bármikor',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: ShieldCheck,
    title: 'CE tanúsított',
    description: 'Minőségi garancia',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

export function TrustBadges() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 py-8 lg:py-10">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.title}
                className="flex items-center gap-4 justify-center lg:justify-start"
              >
                <div className={`flex-shrink-0 w-12 h-12 ${badge.iconBg} rounded-full flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${badge.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm lg:text-base">
                    {badge.title}
                  </h3>
                  <p className="text-gray-500 text-xs lg:text-sm">
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
