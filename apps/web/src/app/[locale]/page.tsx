import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatters";

export default function HomePage() {
  const t = useTranslations();

  // Test price formatting
  const testPrice = formatPrice(15900);
  console.log("Price test:", testPrice); // Should output "15 900 Ft"

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-foreground">
        {t("common.siteName")}
      </h1>
      <p className="text-lg text-muted-foreground">
        Tuzvedelmi eszkozok es biztonsagi felszerelesek
      </p>
      <p className="text-sm text-muted-foreground">
        Pelda ar: {testPrice}
      </p>
      <div className="flex gap-4">
        <Button>{t("products.title")}</Button>
        <Button variant="outline">{t("categories.title")}</Button>
      </div>
    </main>
  );
}
