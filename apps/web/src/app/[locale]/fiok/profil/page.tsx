import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { requireAuth } from "@/lib/auth/dal";
import { getCurrentUserProfile } from "@/lib/auth/actions";
import { ProfileForm } from "@/components/account/ProfileForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Profil beállítások | CSZ Tűzvédelmi Webáruház",
  description: "Személyes és céges adatok szerkesztése",
};

export default async function ProfilePage() {
  // Ensure user is authenticated
  await requireAuth("/hu/fiok/profil");

  // Get full user profile from Strapi
  const { user, error } = await getCurrentUserProfile();

  if (error || !user) {
    return (
      <div className="site-container py-8">
        <div className="text-center">
          <p className="text-destructive">{error || "Profil betöltése sikertelen"}</p>
          <Link href="/fiok">
            <Button variant="outline" className="mt-4">
              Vissza a fiókhoz
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="site-container py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/fiok"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Vissza a fiókhoz
        </Link>
        <h1 className="text-2xl font-bold">Profil beállítások</h1>
        <p className="text-muted-foreground mt-1">
          Frissítsd a személyes és céges adataidat
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <div className="mb-6 pb-4 border-b">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">E-mail:</span> {user.email}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Felhasználónév:</span> {user.username}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Az e-mail cím és felhasználónév nem módosítható.
          </p>
        </div>

        <ProfileForm user={user} />
      </div>
    </div>
  );
}
