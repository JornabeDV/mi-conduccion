"use server";

import { cashCountCreateSchema } from "@/server/validators/cash-count";
import { cashCountService } from "@/server/services/cash-count-service";
import { requireUserId } from "@/server/actions";
import { handleActionError, type ActionResult } from "@/server/actions/utils";
import { revalidatePath } from "next/cache";

export async function saveCashCount(formData: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const input = cashCountCreateSchema.parse(formData);
    await cashCountService.save(userId, input);
    revalidatePath("/administracion-caja");
    revalidatePath("/jornadas");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteCashCount(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    await cashCountService.delete(id, userId);
    revalidatePath("/administracion-caja");
    revalidatePath("/jornadas");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
