"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/atoms/logo";
import { Wordmark } from "@/components/atoms/wordmark";
import { ThemeToggle } from "@/components/atoms/theme-toggle";
import { SidebarNav } from "@/components/molecules/sidebar-nav";
import { BottomNav } from "@/components/molecules/bottom-nav";
import { MobileMenu } from "@/components/molecules/mobile-menu";
import { UserMenu } from "@/components/molecules/user-menu";
import { Separator } from "@/components/ui/separator";

type DashboardShellProps = {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  children: React.ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-full">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-40 items-center justify-center px-5">
          <Logo showText={false} imageClassName="h-32 w-32" />
        </div>
        <Separator />
        <div className="flex flex-1 flex-col gap-4 overflow-auto py-4">
          <SidebarNav />
        </div>
        <Separator />
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-muted-foreground">Apariencia</span>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </Button>
            <Wordmark className="h-7" />
          </div>

          <div className="hidden md:block" />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </header>

        {/* Main content */}
        <main className="min-w-0 flex-1 pb-20 md:pb-6">
          <div className="container px-4 py-6 md:px-6">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <BottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
        <MobileMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      </div>
    </div>
  );
}
