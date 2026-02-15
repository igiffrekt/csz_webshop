import { Phone, Truck, Gift, CreditCard, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';

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

          {/* Center - Promotional messages */}
          <div className="flex items-center justify-center flex-1 lg:flex-none">
            <div className="flex items-center gap-6 text-xs sm:text-sm">
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ingyenes szállítás 50.000 Ft+</span>
                <span className="sm:hidden">Ingyenes szállítás</span>
              </span>
              <span className="hidden md:flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5" />
                <span>Napi ajánlatok</span>
              </span>
              <span className="hidden lg:flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                <span>Biztonságos fizetés</span>
              </span>
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
