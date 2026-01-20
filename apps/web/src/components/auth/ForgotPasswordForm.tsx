"use client";

import { useActionState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction, type AuthState } from "@/lib/auth/actions";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    forgotPasswordAction,
    {}
  );

  if (state.success) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md">
          Ha ez az email cim regisztralva van, hamarosan kapsz egy emailt a jelszo visszaallitasahoz.
        </div>
        <p className="text-sm text-muted-foreground">
          Nem kaptad meg? Ellenorizd a spam mappat, vagy{" "}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-foreground hover:underline"
          >
            probald ujra
          </button>
        </p>
        <Link href="/auth/bejelentkezes">
          <Button variant="outline" className="w-full">
            Vissza a bejelentkezeshez
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
        <Label htmlFor="email">Email cim</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="pelda@email.hu"
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

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Kuldese..." : "Jelszo visszaallitas kerese"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Emlekszel a jelszavadra?{" "}
        <Link
          href="/auth/bejelentkezes"
          className="font-medium text-foreground hover:underline"
        >
          Bejelentkezes
        </Link>
      </p>
    </form>
  );
}
