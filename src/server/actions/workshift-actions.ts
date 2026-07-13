"use server";

import {
  workShiftCreateSchema,
  workShiftUpdateSchema,
  type WorkShiftCreateInput,
  type WorkShiftUpdateInput,
} from "@/server/validators/workshift";
import { workShiftService } from "@/server/services/workshift-service";
import { requireUserId } from "@/server/actions";
import { handleActionError, type ActionResult } from "@/server/actions/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createWorkShift(formData: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const input = workShiftCreateSchema.parse(formData) as WorkShiftCreateInput;
    await workShiftService.create(userId, {
      ...input,
      date: input.date,
      startedAt: input.startedAt,
      endedAt: input.endedAt ?? null,
      onlineHours: input.onlineHours ?? null,
      distanceKm: input.distanceKm ?? null,
      notes: input.notes ?? null,
      incomes: input.incomes.map((income) => ({
        ...income,
        platform: income.platform ?? null,
        notes: income.notes ?? null,
      })),
    });
    revalidatePath("/jornadas");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateWorkShift(id: string, formData: unknown): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    const input = workShiftUpdateSchema.parse(formData) as WorkShiftUpdateInput;
    await workShiftService.update(id, userId, {
      ...input,
      incomes: input.incomes?.map((income) => ({
        ...income,
        platform: income.platform ?? null,
        notes: income.notes ?? null,
      })),
    });
    revalidatePath("/jornadas");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteWorkShift(id: string): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    await workShiftService.delete(id, userId);
    revalidatePath("/jornadas");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createWorkShiftAndRedirect(formData: unknown): Promise<ActionResult> {
  const result = await createWorkShift(formData);
  if (result.success) {
    redirect("/jornadas");
  }
  return result;
}
