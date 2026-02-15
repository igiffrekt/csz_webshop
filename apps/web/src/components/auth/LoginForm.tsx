"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type AuthState } from "@/lib/auth-actions";

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      router.push(redirectTo || '/hu');
      router.refresh();
    }
  }, [state.success, redirectTo, router]);

  return (
    <form action={formAction} className="space-y-4">
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

      {state.error && (
        <div role="alert" className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Jelszó</Label>
          <Link
            href="/auth/elfelejtett-jelszo"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Elfelejtett jelszó?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={isPending}
        />
        {state.fieldErrors?.password && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Bejelentkezés..." : "Bejelentkezés"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Még nincs fiókod?{" "}
        <Link
          href={redirectTo ? `/auth/regisztracio?redirect=${encodeURIComponent(redirectTo)}` : "/auth/regisztracio"}
          className="font-medium text-foreground hover:underline"
        >
          Regisztráció
        </Link>
      </p>
    </form>
  );
}
