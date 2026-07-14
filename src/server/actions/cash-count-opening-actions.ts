"use server";

import { z } from "zod";
import { cashCountService } from "@/server/services/cash-count-service";
import { requireUserId } from "@/server/actions";
import { handleActionError, type ActionResult } from "@/server/actions/utils";
import { revalidatePath } from "next/cache";
import { denominationSchema } from "@/server/validators/cash-count";
import { moneySchema } from "@/server/validators/common";

const openingCashCountSchema = z.object({
  vehicleId: z.string().uuid(),
  date: z.coerce.date(),
  denominations: z.array(denominationSchema).default([]),
  transferAmount: moneySchema.nullable().optional(),
  appAmount: moneySchema.nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export async function saveOpeningCashCount(formData: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const input = openingCashCountSchema.parse(formData);
    await cashCountService.createOpening(userId, input);
    revalidatePath("/administracion-caja");
    revalidatePath("/jornadas");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
