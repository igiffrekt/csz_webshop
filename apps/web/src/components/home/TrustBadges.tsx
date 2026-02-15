'use client';

import { Truck, Wallet, Headphones, Shield, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  wallet: Wallet,
  headphones: Headphones,
  shield: Shield,
};

const defaultBadges = [
  {
    icon: Truck,
    title: 'Ingyenes szállítás',
    description: '50.000 Ft feletti rendelés esetén',
    color: 'from-amber-400 to-orange-400',
    glow: 'group-hover:shadow-amber-200/50',
  },
  {
    icon: Wallet,
    title: 'Rugalmas fizetés',
    description: 'Többféle fizetési lehetőség',
    color: 'from-emerald-400 to-teal-400',
    glow: 'group-hover:shadow-emerald-200/50',
  },
  {
    icon: Headphones,
    title: '24/7 Ügyfélszolgálat',
    description: 'Támogatjuk Önt bármikor',
    color: 'from-blue-400 to-indigo-400',
    glow: 'group-hover:shadow-blue-200/50',
  },
];

const badgeColors = [
  { color: 'from-amber-400 to-orange-400', glow: 'group-hover:shadow-amber-200/50' },
  { color: 'from-emerald-400 to-teal-400', glow: 'group-hover:shadow-emerald-200/50' },
  { color: 'from-blue-400 to-indigo-400', glow: 'group-hover:shadow-blue-200/50' },
  { color: 'from-violet-400 to-purple-400', glow: 'group-hover:shadow-violet-200/50' },
];

interface SanityTrustBadge {
  _key?: string;
  title?: string;
  description?: string;
  icon?: string;
}

interface TrustBadgesProps {
  trustBadges?: SanityTrustBadge[];
}

export function TrustBadges({ trustBadges }: TrustBadgesProps) {
  const badges = trustBadges && trustBadges.length > 0
    ? trustBadges.map((b, i) => ({
        icon: iconMap[b.icon || ''] || Shield,
        title: b.title || '',
        description: b.description || '',
        color: badgeColors[i % badgeColors.length].color,
        glow: badgeColors[i % badgeColors.length].glow,
      }))
    : defaultBadges;

  return (
    <section className="py-6 lg:py-10 bg-gradient-to-r from-gray-50 via-white to-gray-50">
      <div className="site-container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
                className="group"
              >
                <div className={`relative flex items-center gap-4 p-5 lg:p-6 rounded-2xl bg-white border border-gray-100 hover:border-transparent transition-all duration-300 hover:shadow-xl ${badge.glow} cursor-default`}>
                  {/* Icon with gradient bg */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm lg:text-base">
                      {badge.title}
                    </h3>
                    <p className="text-gray-500 text-xs lg:text-sm mt-0.5">
                      {badge.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
