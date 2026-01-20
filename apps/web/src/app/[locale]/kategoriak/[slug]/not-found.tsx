import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function CategoryNotFound() {
  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Kategoria nem talalhato</h1>
      <p className="text-muted-foreground mb-8">
        A keresett kategoria nem letezik vagy eltavolitasra kerult.
      </p>
      <Link href="/kategoriak">
        <Button>Vissza a kategoriakhoz</Button>
      </Link>
    </main>
  );
}
