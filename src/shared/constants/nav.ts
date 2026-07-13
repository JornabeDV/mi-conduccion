import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarClock,
  Receipt,
  Fuel,
  Car,
  Bell,
  Target,
  BarChart3,
  Calendar,
  History,
  FileText,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  shortcut?: string;
};

export const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jornadas", href: "/jornadas", icon: CalendarClock },
  { label: "Gastos", href: "/gastos", icon: Receipt },
  { label: "Combustible", href: "/combustible", icon: Fuel },
  { label: "Vehículo", href: "/vehiculo", icon: Car },
  { label: "Recordatorios", href: "/recordatorios", icon: Bell },
  { label: "Objetivos", href: "/objetivos", icon: Target },
  { label: "Estadísticas", href: "/estadisticas", icon: BarChart3 },
  { label: "Calendario", href: "/calendario", icon: Calendar },
  { label: "Historial", href: "/historial", icon: History },
  { label: "Reportes", href: "/reportes", icon: FileText },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jornadas", href: "/jornadas", icon: CalendarClock },
  { label: "Gastos", href: "/gastos", icon: Receipt },
  { label: "Más", href: "#menu", icon: BarChart3 },
];
