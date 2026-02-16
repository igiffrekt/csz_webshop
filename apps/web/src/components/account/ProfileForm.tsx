"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction, type AuthState } from "@/lib/auth-actions";
import type { UserProfile } from "@csz/types";

interface ProfileFormProps {
  user: UserProfile;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    updateProfileAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md text-sm">
          Profil sikeresen frissítve!
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Személyes adatok</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Vezetéknév</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              defaultValue={user.firstName || ""}
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
              defaultValue={user.lastName || ""}
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
          <Label htmlFor="phone">Telefonszám</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone || ""}
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
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h2 className="text-lg font-semibold">Céges adatok (B2B)</h2>
        <p className="text-sm text-muted-foreground">
          Töltsd ki, ha céges számlát szeretnél kérni
        </p>

        <div className="space-y-2">
          <Label htmlFor="companyName">Cégnév</Label>
          <Input
            id="companyName"
            name="companyName"
            type="text"
            defaultValue={user.companyName || ""}
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
            defaultValue={user.vatNumber || ""}
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

      <div className="pt-4">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto h-11 sm:h-10 rounded-full bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400">
          <span className="mr-2 text-[0.5rem] leading-none">&#9679;</span>
          {isPending ? "Mentés..." : "Változások mentése"}
        </Button>
      </div>
    </form>
  );
}
