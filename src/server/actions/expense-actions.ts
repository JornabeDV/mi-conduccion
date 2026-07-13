"use server";

import {
  expenseCreateSchema,
  expenseUpdateSchema,
  type ExpenseCreateInput,
  type ExpenseUpdateInput,
} from "@/server/validators/expense";
import { expenseService } from "@/server/services/expense-service";
import { requireUserId } from "@/server/actions";
import { handleActionError, type ActionResult } from "@/server/actions/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createExpense(formData: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const input = expenseCreateSchema.parse(formData) as ExpenseCreateInput;
    await expenseService.create(userId, {
      ...input,
      vehicleId: input.vehicleId ?? null,
      shiftId: input.shiftId ?? null,
    });
    revalidatePath("/gastos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateExpense(id: string, formData: unknown): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    const input = expenseUpdateSchema.parse(formData) as ExpenseUpdateInput;
    await expenseService.update(id, userId, input);
    revalidatePath("/gastos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    await expenseService.delete(id, userId);
    revalidatePath("/gastos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createExpenseAndRedirect(formData: unknown): Promise<ActionResult> {
  const result = await createExpense(formData);
  if (result.success) {
    redirect("/gastos");
  }
  return result;
}
