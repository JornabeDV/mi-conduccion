export const REMINDER_TYPES = ["DATE", "ODOMETER"] as const;

export type ReminderType = (typeof REMINDER_TYPES)[number];

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  DATE: "Por fecha",
  ODOMETER: "Por odómetro",
};
