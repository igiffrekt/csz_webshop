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
import type { Session } from 'next-auth';

async function safeAuth(): Promise<Session | null> {
  try {
    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 3000)
    );
    return await Promise.race([auth() as Promise<Session | null>, timeout]);
  } catch {
    return null;
  }
}

export async function Header() {
  const t = await getTranslations('nav');
  const session = await safeAuth();
  const isAuth = !!session?.user;

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Main header - matching Figma design */}
      <div className="site-container">
        <div className="flex items-center h-16 lg:h-[92px]">
          {/* Mobile: hamburger on left */}
          <div className="lg:hidden flex-shrink-0 -ml-2">
            <MobileNav />
          </div>

          {/* Logo — centered on mobile, left-aligned on desktop */}
          <Link href="/" className="flex-shrink-0 flex-1 lg:flex-none flex justify-center lg:justify-start">
            <Logo />
          </Link>

          {/* Spacer to align hamburger with vertical nav left edge (340px nav - 90px logo) */}
          <div className="hidden lg:block w-[250px] flex-shrink-0" />

          {/* Center section: Menu + Search */}
          <nav aria-label="Fő navigáció" className="hidden lg:flex items-center gap-6 flex-1">
            {/* Hamburger menu / Categories */}
            <MegaMenu variant="icon" />

            {/* Search bar - dynamic width with right margin for spacing from icons */}
            <SearchBar variant="hero" className="flex-1 mr-[50px]" />
          </nav>

          {/* Right section: Store icons */}
          <div className="flex items-center gap-6">
            {/* User — desktop only */}
            {isAuth && session?.user ? (
              <div className="hidden lg:block">
                <UserMenu username={session.user.username || session.user.name || ''} email={session.user.email || ''} />
              </div>
            ) : (
              <Link
                href="/auth/bejelentkezes"
                className="hidden lg:flex items-center justify-center hover:opacity-70 transition-opacity"
                title={t('login')}
              >
                <Image src="/icons/shop-profile-icon.svg" alt="Profil" width={24} height={24} />
              </Link>
            )}

            {/* Cart */}
            <HeaderCart />
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
