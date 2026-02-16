"use client";

import { useActionState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction, type AuthState } from "@/lib/auth-actions";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    forgotPasswordAction,
    {}
  );

  if (state.success) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md">
          Ha ez az e-mail cím regisztrálva van, hamarosan kapsz egy e-mailt a jelszó visszaállításához.
        </div>
        <p className="text-sm text-muted-foreground">
          Nem kaptad meg? Ellenőrizd a spam mappát, vagy{" "}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-foreground hover:underline"
          >
            próbáld újra
          </button>
        </p>
        <Link href="/auth/bejelentkezes">
          <Button variant="outline" className="w-full">
            Vissza a bejelentkezéshez
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">E-mail cím</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="példa@email.hu"
          required
          autoComplete="email"
          disabled={isPending}
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full h-11 sm:h-10 rounded-full bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400" disabled={isPending}>
        <span className="mr-2 text-[0.5rem] leading-none">&#9679;</span>
        {isPending ? "Küldés..." : "Jelszó visszaállítás kérése"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Emlékszel a jelszavadra?{" "}
        <Link
          href="/auth/bejelentkezes"
          className="font-medium text-foreground hover:underline"
        >
          Bejelentkezés
        </Link>
      </p>
    </form>
  );
}
