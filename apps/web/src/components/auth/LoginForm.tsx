"use client";

import { useActionState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type AuthState } from "@/lib/auth/actions";

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

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
        {state.fieldErrors?.identifier && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.identifier[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Jelszo</Label>
          <Link
            href="/auth/elfelejtett-jelszo"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Elfelejtett jelszo?
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
        {isPending ? "Bejelentkezes..." : "Bejelentkezes"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Meg nincs fiokod?{" "}
        <Link
          href="/auth/regisztracio"
          className="font-medium text-foreground hover:underline"
        >
          Regisztracio
        </Link>
      </p>
    </form>
  );
}
