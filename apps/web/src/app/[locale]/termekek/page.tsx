import { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/api";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { SearchInput } from "@/components/product/SearchInput";
import { Pagination } from "@/components/product/Pagination";
import { EmptyState } from "@/components/product/EmptyState";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products");
  return {
    title: t("title"),
    description: "Bongesszen tuzvedelmi eszkozok szeles valasztekaban",
  };
}

interface Props {
  searchParams: Promise<{
    category?: string;
    q?: string;
    page?: string;
    fireClass?: string;
    cert?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations("products");

  // Fetch categories for filter dropdown
  let categories: Awaited<ReturnType<typeof getCategories>>["data"] = [];
  try {
    const categoriesResponse = await getCategories();
    categories = categoriesResponse.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  // Parse certification parameter (comma-separated string to array)
  const certifications = params.cert ? params.cert.split(",") : undefined;

  // Fetch products with all filters including fire class and certification
  let products: Awaited<ReturnType<typeof getProducts>>["data"] = [];
  let pagination: Awaited<ReturnType<typeof getProducts>>["meta"]["pagination"] | null = null;

  try {
    const productsResponse = await getProducts({
      category: params.category,
      search: params.q,
      fireClass: params.fireClass,
      certification: certifications,
      page: params.page ? parseInt(params.page, 10) : 1,
      pageSize: 12,
    });

    products = productsResponse.data;
    pagination = productsResponse.meta.pagination;
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  const hasFilters = !!(
    params.category ||
    params.q ||
    params.fireClass ||
    params.cert
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        {pagination && (
          <p className="text-muted-foreground">
            {t("showing", { count: pagination.total })}
          </p>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <SearchInput />
        </div>
        <ProductFilters categories={categories} />
      </div>

      {/* Product grid or empty state */}
      {products.length > 0 ? (
        <>
          <ProductGrid products={products} />
          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pageCount}
              totalItems={pagination.total}
            />
          )}
        </>
      ) : (
        <EmptyState hasFilters={hasFilters} />
      )}
    </div>
  );
}
