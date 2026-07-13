import { z } from "zod";

export const goalPeriodEnum = ["DAILY", "WEEKLY", "MONTHLY"] as const;

export const goalCreateSchema = z.object({
  period: z.enum(goalPeriodEnum),
  targetAmount: z.coerce.number().positive("El objetivo debe ser mayor a cero"),
  startDate: z.coerce.date(),
  endDate: z.preprocess((val) => (val === "" ? null : val), z.coerce.date().nullable()).optional(),
  isActive: z.boolean().default(true),
});

export const goalUpdateSchema = goalCreateSchema.partial();

export type GoalCreateInput = z.infer<typeof goalCreateSchema>;
export type GoalUpdateInput = z.infer<typeof goalUpdateSchema>;
