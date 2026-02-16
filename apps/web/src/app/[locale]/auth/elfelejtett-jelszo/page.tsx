import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Elfelejtett jelszó | Dunamenti CSZ Webáruház",
  description: "Állítsd vissza az elfelejtett jelszavadat",
};

export default function ForgotPasswordPage() {
  return (
    <div className="container max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">Elfelejtett jelszó</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Add meg az e-mail címedet és küldünk egy linket a jelszó visszaállításához
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
