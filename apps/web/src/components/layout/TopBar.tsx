import { Phone, Mail, Truck, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function TopBar() {
  return (
    <div className="bg-secondary-900 text-white text-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-10">
          {/* Left side - Contact */}
          <div className="flex items-center gap-6">
            <a
              href="tel:+3612345678"
              className="flex items-center gap-2 hover:text-primary-400 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">+36 1 234 5678</span>
            </a>
            <a
              href="mailto:info@csz-tuzvedelmi.hu"
              className="hidden md:flex items-center gap-2 hover:text-primary-400 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>info@csz-tuzvedelmi.hu</span>
            </a>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="/fiok/rendelesek"
              className="hidden sm:flex items-center gap-2 hover:text-primary-400 transition-colors"
            >
              <Truck className="h-4 w-4" />
              <span>Rendelés követése</span>
            </Link>
            <Link
              href="/kapcsolat"
              className="hidden lg:flex items-center gap-2 hover:text-primary-400 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              <span>Üzlet</span>
            </Link>
            <span className="text-primary-400 font-medium text-xs sm:text-sm">
              Ingyenes szállítás 50.000 Ft felett!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
