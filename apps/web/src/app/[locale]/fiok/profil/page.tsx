import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { requireAuth } from "@/lib/auth/dal";
import { getCurrentUserProfile } from "@/lib/auth/actions";
import { ProfileForm } from "@/components/account/ProfileForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Profil beallitasok | CSZ Tuzvedelmi Webaruhaz",
  description: "Szemelyes es ceges adatok szerkesztese",
};

export default async function ProfilePage() {
  // Ensure user is authenticated
  await requireAuth();

  // Get full user profile from Strapi
  const { user, error } = await getCurrentUserProfile();

  if (error || !user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-destructive">{error || "Profil betoltese sikertelen"}</p>
          <Link href="/fiok">
            <Button variant="outline" className="mt-4">
              Vissza a fiokhoz
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <Link
          href="/fiok"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Vissza a fiokhoz
        </Link>
        <h1 className="text-2xl font-bold">Profil beallitasok</h1>
        <p className="text-muted-foreground mt-1">
          Frissitsd a szemelyes es ceges adataidat
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <div className="mb-6 pb-4 border-b">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Felhasznalonev:</span> {user.username}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Az email cim es felhasznalonev nem modosithato.
          </p>
        </div>

        <ProfileForm user={user} />
      </div>
    </div>
  );
}
