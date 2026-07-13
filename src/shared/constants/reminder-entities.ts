export const REMINDER_ENTITIES = [
  "OIL_CHANGE",
  "FILTER",
  "INSURANCE",
  "VTV",
  "REGISTRATION",
  "TIRES",
  "SERVICE",
  "OTHER",
] as const;

export type ReminderEntity = (typeof REMINDER_ENTITIES)[number];

export const REMINDER_ENTITY_LABELS: Record<ReminderEntity, string> = {
  OIL_CHANGE: "Cambio de aceite",
  FILTER: "Filtro",
  INSURANCE: "Seguro",
  VTV: "VTV",
  REGISTRATION: "Patente",
  TIRES: "Cubiertas",
  SERVICE: "Service",
  OTHER: "Otro",
};
