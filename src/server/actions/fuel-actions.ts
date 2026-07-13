"use server";

import {
  fuelCreateSchema,
  fuelUpdateSchema,
  type FuelCreateInput,
  type FuelUpdateInput,
} from "@/server/validators/fuel";
import { fuelService } from "@/server/services/fuel-service";
import { requireUserId } from "@/server/actions";
import { handleActionError, type ActionResult } from "@/server/actions/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createFuel(formData: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const input = fuelCreateSchema.parse(formData) as FuelCreateInput;
    await fuelService.create(userId, {
      ...input,
      notes: input.notes ?? null,
    });
    revalidatePath("/combustible");
    revalidatePath("/gastos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateFuel(id: string, formData: unknown): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    const input = fuelUpdateSchema.parse(formData) as FuelUpdateInput;
    await fuelService.update(id, userId, {
      ...input,
      notes: input.notes ?? null,
    });
    revalidatePath("/combustible");
    revalidatePath("/gastos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteFuel(id: string): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    await fuelService.delete(id, userId);
    revalidatePath("/combustible");
    revalidatePath("/gastos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createFuelAndRedirect(formData: unknown): Promise<ActionResult> {
  const result = await createFuel(formData);
  if (result.success) {
    redirect("/combustible");
  }
  return result;
}
