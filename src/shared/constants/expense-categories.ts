export const EXPENSE_CATEGORIES = [
  "FUEL",
  "TOLLS",
  "WASH",
  "INSURANCE",
  "REGISTRATION",
  "SERVICE",
  "OIL_CHANGE",
  "TIRES",
  "PARTS",
  "FINES",
  "OTHER",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  FUEL: "Combustible",
  TOLLS: "Peajes",
  WASH: "Lavado",
  INSURANCE: "Seguro",
  REGISTRATION: "Patente",
  SERVICE: "Service",
  OIL_CHANGE: "Cambio de aceite",
  TIRES: "Cubiertas",
  PARTS: "Repuestos",
  FINES: "Multas",
  OTHER: "Otros",
};
