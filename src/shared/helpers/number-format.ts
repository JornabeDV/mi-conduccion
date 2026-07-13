export type FormatNumberOptions = {
  decimals?: number;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
};

/**
 * Formatea un número con separador de miles y coma decimal (es-AR).
 * Devuelve cadena vacía para valores nulos/inválidos.
 */
export function formatNumberInput(
  value: number | string | null | undefined,
  options: FormatNumberOptions = {},
): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const num =
    typeof value === "string" ? parseLocaleNumber(value) : Number(value);

  if (num === null || Number.isNaN(num)) {
    return "";
  }

  const { decimals = 0, min, max, prefix = "", suffix = "" } = options;

  let clamped = num;
  if (min !== undefined) clamped = Math.max(min, clamped);
  if (max !== undefined) clamped = Math.min(max, clamped);

  const formatted = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(clamped);

  return `${prefix}${formatted}${suffix}`;
}

/**
 * Convierte un string con formato local (ej: "1.234,56") a número.
 * Devuelve null si no es válido.
 */
export function parseLocaleNumber(value: string): number | null {
  if (!value || value.trim() === "") return null;

  const normalized = value
    .replace(/\./g, "") // separador de miles
    .replace(",", "."); // separador decimal

  const num = Number(normalized);
  return Number.isNaN(num) ? null : num;
}

/**
 * Limpia el valor mientras el usuario escribe:
 - solo dígitos, una coma y un punto.
 */
export function cleanNumberInput(value: string): string {
  return (
    value
      // solo dígitos, punto y coma
      .replace(/[^0-9.,]/g, "")
      // conserva solo el último punto (decimal)
      .replace(/\.(?=.*\.)/g, "")
      // conserva solo la última coma (decimal)
      .replace(/,(?=.*,)/g, "")
  );
}
