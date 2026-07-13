"use server";

import {
  goalCreateSchema,
  goalUpdateSchema,
  type GoalCreateInput,
  type GoalUpdateInput,
} from "@/server/validators/goal";
import { goalService } from "@/server/services/goal-service";
import { requireUserId } from "@/server/actions";
import { handleActionError, type ActionResult } from "@/server/actions/utils";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const input = goalCreateSchema.parse(formData) as GoalCreateInput;
    await goalService.create(userId, input);
    revalidatePath("/objetivos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateGoal(id: string, formData: unknown): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    const input = goalUpdateSchema.parse(formData) as GoalUpdateInput;
    await goalService.update(id, userId, input);
    revalidatePath("/objetivos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    await goalService.delete(id, userId);
    revalidatePath("/objetivos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
