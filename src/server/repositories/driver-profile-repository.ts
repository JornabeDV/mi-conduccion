import { prisma } from "@/lib/prisma";
import type { DriverProfile } from "@prisma/client";

export type UpdateDriverProfileInput = {
  preferredCurrency?: string;
  timezone?: string;
  defaultVehicleId?: string | null;
  walletProvider?: string | null;
  walletIdentifier?: string | null;
  walletAccountOwner?: string | null;
};

export interface DriverProfileRepository {
  findByUser(userId: string): Promise<DriverProfile | null>;
  update(userId: string, input: UpdateDriverProfileInput): Promise<DriverProfile>;
  upsert(userId: string, input: UpdateDriverProfileInput): Promise<DriverProfile>;
}

export class PrismaDriverProfileRepository implements DriverProfileRepository {
  async findByUser(userId: string): Promise<DriverProfile | null> {
    return prisma.driverProfile.findUnique({
      where: { userId },
    });
  }

  async update(userId: string, input: UpdateDriverProfileInput): Promise<DriverProfile> {
    return prisma.driverProfile.update({
      where: { userId },
      data: {
        preferredCurrency: input.preferredCurrency ?? undefined,
        timezone: input.timezone ?? undefined,
        defaultVehicleId: input.defaultVehicleId !== undefined ? input.defaultVehicleId ?? null : undefined,
        walletProvider: input.walletProvider !== undefined ? input.walletProvider ?? null : undefined,
        walletIdentifier: input.walletIdentifier !== undefined ? input.walletIdentifier ?? null : undefined,
        walletAccountOwner: input.walletAccountOwner !== undefined ? input.walletAccountOwner ?? null : undefined,
      },
    });
  }

  async upsert(userId: string, input: UpdateDriverProfileInput): Promise<DriverProfile> {
    const existing = await this.findByUser(userId);
    if (existing) {
      return this.update(userId, input);
    }
    return prisma.driverProfile.create({
      data: {
        userId,
        preferredCurrency: input.preferredCurrency ?? "ARS",
        timezone: input.timezone ?? "America/Argentina/Buenos_Aires",
        defaultVehicleId: input.defaultVehicleId ?? null,
        walletProvider: input.walletProvider ?? null,
        walletIdentifier: input.walletIdentifier ?? null,
        walletAccountOwner: input.walletAccountOwner ?? null,
      },
    });
  }
}

export const driverProfileRepository = new PrismaDriverProfileRepository();
