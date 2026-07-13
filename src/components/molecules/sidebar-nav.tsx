"use client";

import { MAIN_NAV } from "@/shared/constants/nav";
import { NavItemButton } from "@/components/atoms/nav-item";

type SidebarNavProps = {
  onItemClick?: () => void;
};

export function SidebarNav({ onItemClick }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {MAIN_NAV.map((item) => (
        <NavItemButton key={item.href} {...item} onClick={onItemClick} />
      ))}
    </nav>
  );
}
