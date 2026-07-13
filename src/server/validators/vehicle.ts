import { z } from "zod";

export const fuelTypeEnum = ["NAFTA", "DIESEL", "GNC", "ELECTRIC", "HYBRID"] as const;

export const vehicleCreateSchema = z.object({
  brand: z.string().min(2, "La marca es obligatoria"),
  model: z.string().min(2, "El modelo es obligatorio"),
  year: z.coerce.number().int().min(1900).max(2100).nullable().optional(),
  licensePlate: z.string().min(2, "La patente es obligatoria"),
  currentKm: z.coerce.number().nonnegative("El kilometraje no puede ser negativo"),
  fuelType: z.enum(fuelTypeEnum),
  tankCapacity: z.coerce.number().positive().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const vehicleUpdateSchema = vehicleCreateSchema.partial();

export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;
