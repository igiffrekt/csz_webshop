import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { HeaderCart } from "./HeaderCart";
import { UserMenu } from "./UserMenu";
import { verifySession } from "@/lib/auth/dal";

const navLinks = [
  { href: "/termekek", labelKey: "products" },
  { href: "/kategoriak", labelKey: "categories" },
  { href: "/kapcsolat", labelKey: "contact" },
] as const;

export async function Header() {
  const t = await getTranslations("nav");
  const { isAuth, session } = await verifySession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile menu + Logo */}
        <div className="flex items-center gap-2">
          <MobileNav />
          <Logo />
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">{t("search")}</span>
          </Button>
          {isAuth && session ? (
            <UserMenu username={session.username} email={session.email} />
          ) : (
            <Link href="/auth/bejelentkezes">
              <Button variant="ghost" size="sm">
                {t("login")}
              </Button>
            </Link>
          )}
          <HeaderCart />
        </div>
      </div>
    </header>
  );
}
