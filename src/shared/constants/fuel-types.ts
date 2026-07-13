export const FUEL_TYPES = [
  "NAFTA",
  "DIESEL",
  "GNC",
  "ELECTRIC",
  "HYBRID",
] as const;

export type FuelType = (typeof FUEL_TYPES)[number];

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  NAFTA: "Nafta",
  DIESEL: "Diésel",
  GNC: "GNC",
  ELECTRIC: "Eléctrico",
  HYBRID: "Híbrido",
};
