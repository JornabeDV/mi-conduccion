export const INCOME_TYPES = [
  "PLATFORM",
  "TIP",
  "BONUS",
  "OTHER",
] as const;

export type IncomeType = (typeof INCOME_TYPES)[number];

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  PLATFORM: "Plataforma",
  TIP: "Propina",
  BONUS: "Bonificación",
  OTHER: "Otro",
};
