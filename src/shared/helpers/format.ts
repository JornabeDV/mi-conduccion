import { format } from "date-fns";
import { es } from "date-fns/locale";

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

  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2,
  }).format(value);
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
