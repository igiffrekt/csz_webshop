"use client";

import { User, LogOut, Package, MapPin, Settings } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/auth/actions";

interface UserMenuProps {
  username: string;
  email: string;
}

export function UserMenu({ username, email }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <User className="h-5 w-5" />
          <span className="sr-only">Felhasznaloi menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{username}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/fiok" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Fiokom
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/fiok/rendelesek" className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            Rendeleseim
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/fiok/cimek" className="cursor-pointer">
            <MapPin className="mr-2 h-4 w-4" />
            Szallitasi cimek
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Kijelentkezes
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
