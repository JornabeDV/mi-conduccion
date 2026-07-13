"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CalendarClock, Receipt, Menu } from "lucide-react";

const BOTTOM_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jornadas", href: "/jornadas", icon: CalendarClock },
  { label: "Gastos", href: "/gastos", icon: Receipt },
];

type BottomNavProps = {
  onOpenMenu: () => void;
};

export function BottomNav({ onOpenMenu }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-16 items-center justify-around">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenMenu}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Menu className="size-5" />
          <span>Más</span>
        </Button>
      </div>
    </nav>
  );
}
