import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SearchBar } from './SearchBar';
import { Logo } from './Logo';
import { HeaderCart } from './HeaderCart';
import { UserMenu } from './UserMenu';
import { MobileNav } from './MobileNav';
import { MegaMenu } from './MegaMenu';
import { auth } from '@/lib/auth';

export async function Header() {
  const t = await getTranslations('nav');
  const session = await auth();
  const isAuth = !!session?.user;

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Main header - matching Figma design */}
      <div className="site-container">
        <div className="flex items-center h-[92px]">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>

          {/* Spacer to align hamburger with vertical nav left edge (340px nav - 90px logo) */}
          <div className="hidden lg:block w-[250px] flex-shrink-0" />

          {/* Center section: Menu + Search */}
          <div className="hidden lg:flex items-center gap-6 flex-1">
            {/* Hamburger menu / Categories */}
            <MegaMenu variant="icon" />

            {/* Search bar - dynamic width with right margin for spacing from icons */}
            <SearchBar variant="hero" className="flex-1 mr-[50px]" />
          </div>

          {/* Right section: Store icons - small gaps between them */}
          <div className="flex items-center gap-6">
            {/* User */}
            {isAuth && session?.user ? (
              <UserMenu username={session.user.username || session.user.name || ''} email={session.user.email || ''} />
            ) : (
              <Link
                href="/auth/bejelentkezes"
                className="hidden md:flex items-center justify-center hover:opacity-70 transition-opacity"
                title={t('login')}
              >
                <Image src="/icons/shop-profile-icon.svg" alt="Profil" width={24} height={24} />
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

      {/* Mobile search */}
      <div className="lg:hidden border-t border-black/10 px-4 py-3 bg-[#fef9f3]">
        <SearchBar />
      </div>
    </header>
  );
}
