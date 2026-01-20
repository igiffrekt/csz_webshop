import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Regisztracio | CSZ Tuzvedelmi Webaruhaz",
  description: "Hozd letre a fiokod a gyorsabb vasarlashoz",
};

export default function RegisterPage() {
  return (
    <div className="container max-w-md py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Fiok letrehozasa</h1>
        <p className="text-muted-foreground mt-2">
          Regisztralj a gyorsabb vasarlashoz es rendeleseid kovethesehez
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
