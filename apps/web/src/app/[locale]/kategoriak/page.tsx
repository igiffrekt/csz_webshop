import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCategories } from "@/lib/api";
import { CategoryCard } from "@/components/category/CategoryCard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories");
  return {
    title: t("title"),
    description: "Bongessze tuzvedelmi eszkoz kategoriaink kozott",
  };
}

export default async function CategoriesPage() {
  const t = await getTranslations("categories");
  const categoriesResponse = await getCategories();

  // Filter to top-level categories only (those without parent)
  const topLevelCategories = categoriesResponse.data.filter(
    (cat) => !cat.parent
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      {topLevelCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topLevelCategories.map((category) => (
            <CategoryCard key={category.documentId} category={category} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">{t("noCategories")}</p>
      )}
    </main>
  );
}
