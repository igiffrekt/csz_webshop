import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Jelszo visszaallitas | CSZ Tuzvedelmi Webaruhaz",
  description: "Allitsd be az uj jelszavadat",
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
      <div className="container max-w-md py-16">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Ervenytelen link</h1>
          <p className="text-muted-foreground">
            Ez a jelszo visszaallitasi link ervenytelen vagy lejart.
          </p>
          <Link href="/auth/elfelejtett-jelszo">
            <Button>Uj link kerese</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Uj jelszo beallitasa</h1>
        <p className="text-muted-foreground mt-2">
          Add meg az uj jelszavadat
        </p>
      </div>

      <ResetPasswordForm code={code} />
    </div>
  );
}
