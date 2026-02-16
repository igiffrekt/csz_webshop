import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Bejelentkezés | Dunamenti CSZ Webáruház",
  description: "Jelentkezz be a fiókodba",
};

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string; reset?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect, reset } = await searchParams;

  return (
    <div className="container max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">Bejelentkezés</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Add meg az adataidat a bejelentkezéshez
        </p>
      </div>

      {reset === "success" && (
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md text-sm mb-4">
          A jelszavad sikeresen megváltozott. Most már bejelentkezhetsz.
        </div>
      )}

      <LoginForm redirectTo={redirect} />
    </div>
  );
}
