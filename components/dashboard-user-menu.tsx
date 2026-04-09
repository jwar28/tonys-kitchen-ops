"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";

type DashboardUserMenuProps = {
  signOutAction: () => Promise<void>;
};

export function DashboardUserMenu({ signOutAction }: DashboardUserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="transition hover:brightness-105">
        <Image
          src="/logo.png"
          alt="Tony's Kitchen Ops"
          width={120}
          height={120}
          className="h-[5.75rem] w-[5.75rem] object-contain object-center"
          unoptimized
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl p-2">
        <DropdownMenuLabel className="px-2 pb-1 text-xs text-muted-foreground">Sesion activa</DropdownMenuLabel>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" className="h-9 w-full rounded-lg text-sm">
            Cerrar sesion
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
