import { z } from "zod";
import { moneySchema } from "./common";

const signedMoneySchema = z
  .union([z.string(), z.number()])
  .transform((value) => (typeof value === "string" ? Number(value) : value))
  .pipe(z.number());

export const cashCountTypeEnum = ["OPEN", "CLOSE"] as const;

export const denominationSchema = z.object({
  value: z.coerce.number().positive(),
  quantity: z.coerce.number().int().nonnegative(),
  label: z.string(),
});

export const cashCountCreateSchema = z.object({
  shiftId: z.string().uuid(),
  type: z.enum(cashCountTypeEnum),
  date: z.coerce.date(),
  denominations: z.array(denominationSchema).default([]),
  transferAmount: moneySchema.nullable().optional(),
  appAmount: signedMoneySchema.nullable().optional(),
  extraAmount: moneySchema.nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const cashCountUpdateSchema = cashCountCreateSchema.partial().omit({ shiftId: true, type: true });

export type CashCountCreateInput = z.infer<typeof cashCountCreateSchema>;
export type CashCountUpdateInput = z.infer<typeof cashCountUpdateSchema>;
export type DenominationInput = z.infer<typeof denominationSchema>;
