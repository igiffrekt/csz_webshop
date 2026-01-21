import { Suspense } from 'react';
import { User, Heart } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { TopBar } from './TopBar';
import { MegaMenu } from './MegaMenu';
import { SearchBar } from './SearchBar';
import { Logo } from './Logo';
import { HeaderCart } from './HeaderCart';
import { UserMenu } from './UserMenu';
import { MobileNav } from './MobileNav';
import { verifySession } from '@/lib/auth/dal';

export async function Header() {
  const t = await getTranslations('nav');
  const { isAuth, session } = await verifySession();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar with contact and utility links */}
      <TopBar />

      {/* Main header */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4 lg:gap-8">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo />
            </Link>

            {/* Search - desktop only */}
            <div className="hidden lg:flex flex-1 justify-center max-w-2xl">
              <SearchBar />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Wishlist - desktop only */}
              <Link
                href="/kedvencek"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary-100 transition-colors"
                title="Kedvencek"
              >
                <Heart className="h-5 w-5 text-secondary-600" />
              </Link>

              {/* User menu */}
              {isAuth && session ? (
                <UserMenu username={session.username} email={session.email} />
              ) : (
                <Link href="/auth/bejelentkezes">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">{t('login')}</span>
                  </Button>
                </Link>
              )}

              {/* Cart */}
              <HeaderCart />

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <MobileNav />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bar - desktop only */}
      <nav className="hidden lg:block border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-8 h-12">
            {/* Mega menu */}
            <MegaMenu />

            {/* Main nav links */}
            <div className="flex items-center gap-6">
              <Link
                href="/termekek"
                className="text-sm font-medium text-secondary-700 hover:text-primary-500 transition-colors"
              >
                Összes termék
              </Link>
              <Link
                href="/termekek?featured=true"
                className="text-sm font-medium text-secondary-700 hover:text-primary-500 transition-colors"
              >
                Kiemelt
              </Link>
              <Link
                href="/termekek?onSale=true"
                className="text-sm font-medium text-danger hover:text-danger/80 transition-colors"
              >
                Akciók
              </Link>
              <Link
                href="/ajanlatkeres"
                className="text-sm font-medium text-secondary-700 hover:text-primary-500 transition-colors"
              >
                Árajánlat
              </Link>
              <Link
                href="/kapcsolat"
                className="text-sm font-medium text-secondary-700 hover:text-primary-500 transition-colors"
              >
                Kapcsolat
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search - mobile only */}
      <div className="lg:hidden border-b p-3">
        <SearchBar />
      </div>
    </header>
  );
}
