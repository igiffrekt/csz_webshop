import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";

const quickLinks = [
  { href: "/termekek", labelKey: "nav.products" },
  { href: "/kategoriak", labelKey: "nav.categories" },
  { href: "/gyik", labelKey: "nav.faq" },
  { href: "/kapcsolat", labelKey: "nav.contact" },
] as const;

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo + Description */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("footer.description")}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">
              {t("footer.quickLinks")}
            </h3>
            <nav className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">
              {t("footer.contactUs")}
            </h3>
            <address className="not-italic text-sm text-muted-foreground space-y-2">
              <p>1234 Budapest</p>
              <p>Példa utca 123.</p>
              <p>
                <a
                  href="tel:+36123456789"
                  className="hover:text-foreground transition-colors"
                >
                  +36 1 234 5678
                </a>
              </p>
              <p>
                <a
                  href="mailto:info@csz.hu"
                  className="hover:text-foreground transition-colors"
                >
                  info@csz.hu
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            {t("footer.copyright", { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
