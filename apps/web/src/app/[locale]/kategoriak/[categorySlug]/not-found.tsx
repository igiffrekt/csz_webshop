import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function CategoryNotFound() {
  return (
    <main className="site-container py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Kategória nem található</h1>
      <p className="text-muted-foreground mb-8">
        A keresett kategória nem létezik vagy eltávolításra került.
      </p>
      <Link href="/kategoriak">
        <Button>Vissza a kategóriákhoz</Button>
      </Link>
    </main>
  );
}
