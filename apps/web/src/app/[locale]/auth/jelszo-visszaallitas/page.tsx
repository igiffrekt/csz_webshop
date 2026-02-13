import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Jelszó visszaállítás | Dunamenti CSZ Webáruház",
  description: "Állítsd be az új jelszavadat",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { code } = await searchParams;

  if (!code) {
    return (
      <div className="container max-w-md mx-auto py-16">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Érvénytelen link</h1>
          <p className="text-muted-foreground">
            Ez a jelszó visszaállítási link érvénytelen vagy lejárt.
          </p>
          <Link href="/auth/elfelejtett-jelszo">
            <Button>Új link kérése</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Új jelszó beállítása</h1>
        <p className="text-muted-foreground mt-2">
          Add meg az új jelszavadat
        </p>
      </div>

      <ResetPasswordForm code={code} />
    </div>
  );
}
