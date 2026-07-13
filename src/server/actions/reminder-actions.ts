"use server";

import {
  reminderCreateSchema,
  reminderUpdateSchema,
  type ReminderCreateInput,
  type ReminderUpdateInput,
} from "@/server/validators/reminder";
import { reminderService } from "@/server/services/reminder-service";
import { requireUserId } from "@/server/actions";
import { handleActionError, type ActionResult } from "@/server/actions/utils";
import { revalidatePath } from "next/cache";

export async function createReminder(formData: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const input = reminderCreateSchema.parse(formData) as ReminderCreateInput;
    await reminderService.create(userId, input);
    revalidatePath("/recordatorios");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateReminder(id: string, formData: unknown): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    const input = reminderUpdateSchema.parse(formData) as ReminderUpdateInput;
    await reminderService.update(id, userId, input);
    revalidatePath("/recordatorios");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function completeReminder(id: string): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    await reminderService.complete(id, userId);
    revalidatePath("/recordatorios");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteReminder(id: string): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    await reminderService.delete(id, userId);
    revalidatePath("/recordatorios");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
