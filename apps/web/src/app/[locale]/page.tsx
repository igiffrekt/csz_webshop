import { getCategories, getFeaturedProducts } from "@/lib/api";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoryGrid } from "@/components/home/CategoryGrid";

export default async function HomePage() {
  // Fetch data in parallel with error handling
  const [categoriesResult, featuredResult] = await Promise.allSettled([
    getCategories(),
    getFeaturedProducts(),
  ]);

  // Extract data with fallbacks for failed requests
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value.data : [];
  const featuredProducts =
    featuredResult.status === "fulfilled" ? featuredResult.value.data : [];

  return (
    <>
      <HeroSection />

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <FeaturedProducts products={featuredProducts} />
      </section>

      {/* Categories Section */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <CategoryGrid categories={categories} />
        </div>
      </section>
    </>
  );
}
