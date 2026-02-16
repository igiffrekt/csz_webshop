import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Regisztráció | Dunamenti CSZ Webáruház",
  description: "Hozd létre a fiókod a gyorsabb vásárláshoz",
};

interface RegisterPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { redirect } = await searchParams;

  return (
    <div className="container max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">Fiók létrehozása</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Regisztrálj a gyorsabb vásárláshoz és rendeléseid követéséhez
        </p>
      </div>

      <RegisterForm redirectTo={redirect} />
    </div>
  );
}
