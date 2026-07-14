import { z } from "zod";

export const driverProfileUpdateSchema = z.object({
  preferredCurrency: z.string().max(3).optional(),
  timezone: z.string().optional(),
  defaultVehicleId: z.string().uuid().nullable().optional(),
  walletProvider: z.string().max(100).nullable().optional(),
  walletIdentifier: z.string().max(200).nullable().optional(),
  walletAccountOwner: z.string().max(200).nullable().optional(),
});

export type DriverProfileUpdateInput = z.infer<typeof driverProfileUpdateSchema>;
