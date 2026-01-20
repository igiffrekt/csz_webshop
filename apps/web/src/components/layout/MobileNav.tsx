"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "./Logo";

const navLinks = [
  { href: "/termekek", labelKey: "products" },
  { href: "/kategoriak", labelKey: "categories" },
  { href: "/kapcsolat", labelKey: "contact" },
  { href: "/gyik", labelKey: "faq" },
] as const;

export function MobileNav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menü megnyitása</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          {navLinks.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 border-b border-border"
              >
                {t(link.labelKey)}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <div className="flex flex-col gap-3 mt-8 pt-4 border-t border-border">
          <SheetClose asChild>
            <Button variant="outline" className="justify-start gap-2">
              <Search className="h-4 w-4" />
              {t("search")}
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="default" className="justify-start gap-2">
              <ShoppingCart className="h-4 w-4" />
              {t("cart")}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
