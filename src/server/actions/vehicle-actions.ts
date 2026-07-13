"use server";

import {
  vehicleCreateSchema,
  vehicleUpdateSchema,
  type VehicleCreateInput,
  type VehicleUpdateInput,
} from "@/server/validators/vehicle";
import { vehicleService } from "@/server/services/vehicle-service";
import { requireUserId } from "@/server/actions";
import { handleActionError, type ActionResult } from "@/server/actions/utils";
import { revalidatePath } from "next/cache";

export async function createVehicle(formData: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const input = vehicleCreateSchema.parse(formData) as VehicleCreateInput;
    await vehicleService.create(userId, input);
    revalidatePath("/vehiculo");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateVehicle(id: string, formData: unknown): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    const input = vehicleUpdateSchema.parse(formData) as VehicleUpdateInput;
    await vehicleService.update(id, userId, input);
    revalidatePath("/vehiculo");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteVehicle(id: string): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
    await vehicleService.delete(id, userId);
    revalidatePath("/vehiculo");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
