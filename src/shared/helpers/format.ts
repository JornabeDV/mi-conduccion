import { format, endOfWeek, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { UTCDate } from "@date-fns/utc";
import { formatNumberInput } from "@/shared/helpers/number-format";
import type { DashboardPeriod } from "@/server/dto/dashboard";

export function formatCurrency(
  value: number | null | undefined,
  currency = "ARS",
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return formatNumberInput(value, { decimals: 2 });
}

export function formatInteger(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return formatNumberInput(value, { decimals: 0 });
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy", { locale: es });
}

export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd MMM", { locale: es });
}

export function formatMonth(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "MMM yyyy", { locale: es });
}

export function formatPercentage(
  value: number | null | undefined,
  decimals = 1,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return `${value.toFixed(decimals)}%`;
}

export function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  return format(new Date(date), "yyyy-MM-dd", { locale: es });
}

export function formatDateTimeInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm", { locale: es });
}

export function formatTimeInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  return format(new Date(date), "HH:mm", { locale: es });
}

// Helpers para fechas "calendario" almacenadas sin hora (@db.Date).
// Se manejan en UTC para evitar desfaces de zona horaria.

export function formatCalendarDate(
  date: Date | string | null | undefined
): string {
  if (!date) return "—";
  const utc = new UTCDate(date);
  return format(utc, "dd/MM/yyyy", { locale: es });
}

export function formatCalendarDateInput(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const utc = new UTCDate(date);
  return format(utc, "yyyy-MM-dd", { locale: es });
}

export function parseCalendarDateInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new UTCDate(year, month - 1, day);
}

export function formatDashboardPeriodLabel(
  period: DashboardPeriod,
  referenceDate: Date
): string {
  const utc = new UTCDate(referenceDate);

  if (period === "day") {
    return `al ${format(utc, "dd/MM/yyyy", { locale: es })}`;
  }

  if (period === "week") {
    const start = startOfWeek(utc, { weekStartsOn: 1 });
    const end = endOfWeek(utc, { weekStartsOn: 1 });
    return `del ${format(start, "dd/MM/yyyy")} al ${format(end, "dd/MM/yyyy")}`;
  }

  return `de ${format(utc, "MMMM yyyy", { locale: es })}`;
}
