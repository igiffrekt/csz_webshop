import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { requireAuth } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth/actions";
import { User, Package, MapPin, Building2, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Fiókom | CSZ Tűzvédelmi Webáruház",
  description: "A fiók beállításaid és rendeléseid",
};

export default async function AccountPage() {
  const session = await requireAuth();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Fiókom</h1>
        <p className="text-muted-foreground mt-1">
          Üdvözöllek, {session.username}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/fiok/profil"
          className="group p-6 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Profil beállítások</h2>
              <p className="text-sm text-muted-foreground">
                Személyes adatok módosítása
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/fiok/cimek"
          className="group p-6 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Szállítási címek</h2>
              <p className="text-sm text-muted-foreground">
                Mentett címek kezelése
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/fiok/rendelesek"
          className="group p-6 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Rendeléseim</h2>
              <p className="text-sm text-muted-foreground">
                Korábbi rendelések megtekintése
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/fiok/ajanlatkeres"
          className="group p-6 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Árajánlat kérések</h2>
              <p className="text-sm text-muted-foreground">
                Árajánlat kérések kezelése
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8 p-6 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-4 mb-4">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Fiók információk</h3>
        </div>
        <dl className="grid gap-2 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">E-mail:</dt>
            <dd>{session.email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Felhasználónév:</dt>
            <dd>{session.username}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8">
        <form action={logoutAction}>
          <Button variant="outline" type="submit">
            Kijelentkezés
          </Button>
        </form>
      </div>
    </div>
  );
}
