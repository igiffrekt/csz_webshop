import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Elfelejtett jelszo | CSZ Tuzvedelmi Webaruhaz",
  description: "Allitsd vissza az elfelejtett jelszavadat",
};

export default function ForgotPasswordPage() {
  return (
    <div className="container max-w-md py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Elfelejtett jelszo</h1>
        <p className="text-muted-foreground mt-2">
          Add meg az email cimedet es kuldunk egy linket a jelszo visszaallitasahoz
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
