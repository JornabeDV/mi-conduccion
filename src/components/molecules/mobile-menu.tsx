"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Logo } from "@/components/atoms/logo";
import { SidebarNav } from "@/components/molecules/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/atoms/theme-toggle";

type MobileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="px-5 pb-2 pt-5 text-left">
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <Logo />
        </SheetHeader>
        <Separator />
        <div className="flex flex-1 flex-col gap-4 overflow-auto py-4">
          <SidebarNav />
        </div>
        <Separator />
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-muted-foreground">Apariencia</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
