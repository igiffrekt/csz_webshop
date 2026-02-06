"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction, type AuthState } from "@/lib/auth-actions";

interface ResetPasswordFormProps {
  code: string;
}

export function ResetPasswordForm({ code }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    resetPasswordAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={code} />

      {state.error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">Új jelszó</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          disabled={isPending}
        />
        {state.fieldErrors?.password && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="passwordConfirmation">Jelszó megerősítése</Label>
        <Input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          required
          autoComplete="new-password"
          disabled={isPending}
        />
        {state.fieldErrors?.passwordConfirmation && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.passwordConfirmation[0]}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Mentés..." : "Jelszó megváltoztatása"}
      </Button>
    </form>
  );
}
