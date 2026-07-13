import { z } from "zod";

export const reminderTypeEnum = ["DATE", "ODOMETER"] as const;
export const reminderEntityEnum = [
  "OIL_CHANGE",
  "FILTER",
  "INSURANCE",
  "VTV",
  "REGISTRATION",
  "TIRES",
  "SERVICE",
  "OTHER",
] as const;

export const reminderCreateSchema = z.object({
  vehicleId: z.string().uuid("Debes seleccionar un vehículo"),
  type: z.enum(reminderTypeEnum),
  entity: z.enum(reminderEntityEnum),
  title: z.string().min(2, "El título es muy corto").max(200),
  dueDate: z.preprocess((val) => (val === "" ? null : val), z.coerce.date().nullable()).optional(),
  dueOdometer: z.coerce.number().nonnegative().nullable().optional(),
  notes: z.string().max(300).nullable().optional(),
});

export const reminderUpdateSchema = reminderCreateSchema.partial();

export type ReminderCreateInput = z.infer<typeof reminderCreateSchema>;
export type ReminderUpdateInput = z.infer<typeof reminderUpdateSchema>;
