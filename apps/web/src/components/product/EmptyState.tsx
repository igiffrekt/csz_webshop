import { getTranslations } from "next-intl/server";
import { Package } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasFilters?: boolean;
}

export async function EmptyState({ hasFilters }: EmptyStateProps) {
  const t = await getTranslations("products");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Package className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{t("noResults")}</h3>
      {hasFilters && (
        <Link href="/termekek">
          <Button variant="outline" className="mt-4">
            {t("clearFilters")}
          </Button>
        </Link>
      )}
    </div>
  );
}
