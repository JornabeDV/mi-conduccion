import { z } from "zod";

export const expenseCategoryEnum = [
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

export const expenseCreateSchema = z.object({
  vehicleId: z.string().uuid().nullable().optional(),
  shiftId: z.string().uuid().nullable().optional(),
  category: z.enum(expenseCategoryEnum),
  date: z.coerce.date(),
  description: z.string().min(2, "La descripción es muy corta").max(300),
  amount: z.coerce.number().positive("El monto debe ser mayor a cero"),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;
