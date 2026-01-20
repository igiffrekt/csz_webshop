import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

const navLinks = [
  { href: "/termekek", labelKey: "products" },
  { href: "/kategoriak", labelKey: "categories" },
  { href: "/kapcsolat", labelKey: "contact" },
] as const;

export function Header() {
  const t = useTranslations("nav");

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
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">{t("cart")}</span>
            {/* Cart badge - will be functional in Phase 4 */}
            {/* <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              0
            </span> */}
          </Button>
        </div>
      </div>
    </header>
  );
}
