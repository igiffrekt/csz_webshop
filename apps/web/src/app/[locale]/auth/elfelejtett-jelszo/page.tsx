import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Elfelejtett jelszó | CSZ Tűzvédelmi Webáruház",
  description: "Állítsd vissza az elfelejtett jelszavadat",
};

export default function ForgotPasswordPage() {
  return (
    <div className="container max-w-md mx-auto py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Elfelejtett jelszó</h1>
        <p className="text-muted-foreground mt-2">
          Add meg az e-mail címedet és küldünk egy linket a jelszó visszaállításához
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
