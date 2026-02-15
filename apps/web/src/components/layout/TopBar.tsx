import { Phone, Truck, Gift, CreditCard, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const promoItems = [
  { icon: Truck, text: 'Ingyenes szállítás 50.000 Ft+' },
  { icon: Gift, text: 'Napi ajánlatok' },
  { icon: CreditCard, text: 'Biztonságos fizetés' },
  { icon: Phone, text: '+36 33 506 690' },
];

export function TopBar() {
  return (
    <div className="bg-[#16a34a] text-white text-sm">
      <div className="site-container">
        <div className="flex items-center justify-between h-10">
          {/* Left side - Welcome message */}
          <div className="hidden lg:flex items-center">
            <span className="text-white/90">
              Üdvözöljük a Dunamenti CSZ Kft. webáruházban!
            </span>
          </div>

          {/* Center - Desktop promotional messages (unchanged) */}
          <div className="hidden lg:flex items-center justify-center flex-1 lg:flex-none">
            <div className="flex items-center gap-6 text-xs sm:text-sm">
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" />
                <span>Ingyenes szállítás 50.000 Ft+</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5" />
                <span>Napi ajánlatok</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                <span>Biztonságos fizetés</span>
              </span>
            </div>
          </div>

          {/* Mobile - Auto-scrolling promo ticker */}
          <div className="lg:hidden flex-1 overflow-hidden promo-ticker-wrap" aria-label="Promóciók">
            <div className="promo-ticker">
              {/* Duplicate items for seamless loop */}
              {[...promoItems, ...promoItems].map((item, i) => {
                const Icon = item.icon;
                return (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-4 text-xs whitespace-nowrap"
                  >
                    <Icon className="h-3 w-3 flex-shrink-0" />
                    <span>{item.text}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right side - Contact & Store */}
          <div className="flex items-center gap-4">
            <a
              href="tel:+3633506690"
              className="hidden sm:flex items-center gap-1.5 hover:text-white/80 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>+36 33 506 690</span>
            </a>
            <Link
              href="/kapcsolat"
              className="hidden md:flex items-center gap-1.5 hover:text-white/80 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Üzlet</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
