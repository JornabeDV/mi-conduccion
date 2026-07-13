import { z } from "zod";

export const fuelCreateSchema = z.object({
  vehicleId: z.string().uuid({ message: "Debes seleccionar un vehículo" }),
  date: z.coerce.date(),
  odometerKm: z.coerce.number().nonnegative("El odómetro no puede ser negativo"),
  liters: z.coerce.number().positive("Los litros deben ser mayores a cero"),
  pricePerLiter: z.coerce.number().positive("El precio debe ser mayor a cero"),
  totalAmount: z.coerce.number().positive("El monto debe ser mayor a cero"),
  fullTank: z.boolean().default(true),
  notes: z.string().max(300).nullable().optional(),
});

export const fuelUpdateSchema = fuelCreateSchema.partial();

export type FuelCreateInput = z.infer<typeof fuelCreateSchema>;
export type FuelUpdateInput = z.infer<typeof fuelUpdateSchema>;
