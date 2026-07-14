"use server";

import { driverProfileUpdateSchema } from "@/server/validators/driver-profile";
import { driverProfileService } from "@/server/services/driver-profile-service";
import { requireUserId } from "@/server/actions";
import { handleActionError, type ActionResult } from "@/server/actions/utils";
import { revalidatePath } from "next/cache";

export async function updateDriverProfile(formData: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const input = driverProfileUpdateSchema.parse(formData);
    await driverProfileService.update(userId, input);
    revalidatePath("/perfil");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
