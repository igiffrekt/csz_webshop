"use client";

import { useActionState, useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { registerAction, type AuthState } from "@/lib/auth-actions";

interface RegisterFormProps {
  redirectTo?: string;
}

export function RegisterForm({ redirectTo }: RegisterFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    registerAction,
    {}
  );
  const [showCompanyFields, setShowCompanyFields] = useState(false);

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Vezetéknév</Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            disabled={isPending}
          />
          {state.fieldErrors?.firstName && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.firstName[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Keresztnév</Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            disabled={isPending}
          />
          {state.fieldErrors?.lastName && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.lastName[0]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Felhasználónév *</Label>
        <Input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          disabled={isPending}
        />
        {state.fieldErrors?.username && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.username[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail cím *</Label>
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
        <Label htmlFor="phone">Telefonszám</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+36 20 123 4567"
          autoComplete="tel"
          disabled={isPending}
        />
        {state.fieldErrors?.phone && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.phone[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Jelszó *</Label>
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
        <Label htmlFor="passwordConfirm">Jelszó megerősítése *</Label>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
          disabled={isPending}
        />
        {state.fieldErrors?.passwordConfirm && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.passwordConfirm[0]}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isCompany"
          checked={showCompanyFields}
          onCheckedChange={(checked) => setShowCompanyFields(checked === true)}
        />
        <Label htmlFor="isCompany" className="text-sm font-normal cursor-pointer">
          Céges vásárló vagyok (számlához szükséges adatok)
        </Label>
      </div>

      {showCompanyFields && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label htmlFor="companyName">Cégnév</Label>
            <Input
              id="companyName"
              name="companyName"
              type="text"
              autoComplete="organization"
              disabled={isPending}
            />
            {state.fieldErrors?.companyName && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.companyName[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vatNumber">Adószám</Label>
            <Input
              id="vatNumber"
              name="vatNumber"
              type="text"
              placeholder="12345678-1-23"
              disabled={isPending}
            />
            {state.fieldErrors?.vatNumber && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.vatNumber[0]}
              </p>
            )}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full h-11 sm:h-10 rounded-full bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400" disabled={isPending}>
        <span className="mr-2 text-[0.5rem] leading-none">&#9679;</span>
        {isPending ? "Regisztráció..." : "Fiók létrehozása"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Már van fiókod?{" "}
        <Link
          href={redirectTo ? `/auth/bejelentkezes?redirect=${encodeURIComponent(redirectTo)}` : "/auth/bejelentkezes"}
          className="font-medium text-foreground hover:underline"
        >
          Bejelentkezés
        </Link>
      </p>
    </form>
  );
}
