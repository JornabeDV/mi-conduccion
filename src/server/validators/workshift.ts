import { z } from "zod";

export const incomeTypeEnum = ["PLATFORM", "TIP", "BONUS", "OTHER"] as const;
export const platformEnum = ["UBER", "CABIFY", "DIDI", "MAXIM", "INDRIVE", "OTHER"] as const;

export const shiftIncomeSchema = z.object({
  type: z.enum(incomeTypeEnum),
  platform: z.enum(platformEnum).nullable().optional(),
  amount: z.coerce.number().nonnegative("El monto no puede ser negativo"),
  notes: z.string().max(200).nullable().optional(),
});

export const workShiftCreateSchema = z.object({
  vehicleId: z.string().uuid().nullable().optional(),
  date: z.coerce.date(),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date().nullable().optional(),
  onlineHours: z.coerce.number().nonnegative().nullable().optional(),
  totalTrips: z.coerce.number().int().nonnegative().default(0),
  distanceKm: z.coerce.number().nonnegative().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  incomes: z.array(shiftIncomeSchema).default([]),
});

export const workShiftUpdateSchema = workShiftCreateSchema.partial();

export type ShiftIncomeInput = z.infer<typeof shiftIncomeSchema>;
export type WorkShiftCreateInput = z.infer<typeof workShiftCreateSchema>;
export type WorkShiftUpdateInput = z.infer<typeof workShiftUpdateSchema>;
