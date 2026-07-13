import type { Prisma, Vehicle } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateVehicleInput = {
  userId: string;
  brand: string;
  model: string;
  year?: number | null;
  licensePlate: string;
  currentKm: number;
  fuelType: "NAFTA" | "DIESEL" | "GNC" | "ELECTRIC" | "HYBRID";
  tankCapacity?: number | null;
};

export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export interface VehicleRepository {
  create(input: CreateVehicleInput): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle | null>;
  findByUser(userId: string): Promise<Vehicle[]>;
  findActiveByUser(userId: string): Promise<Vehicle[]>;
  update(id: string, input: UpdateVehicleInput): Promise<Vehicle>;
  softDelete(id: string): Promise<Vehicle>;
}

export class PrismaVehicleRepository implements VehicleRepository {
  async create(input: CreateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.create({
      data: {
        ...input,
        year: input.year ?? null,
        tankCapacity: input.tankCapacity ?? null,
        deletedAt: null,
      },
    });
  }

  async findById(id: string): Promise<Vehicle | null> {
    return prisma.vehicle.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByUser(userId: string): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActiveByUser(userId: string): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({
      where: { userId, isActive: true, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
    const data: Prisma.VehicleUpdateInput = {
      ...input,
      year: input.year ?? undefined,
      tankCapacity: input.tankCapacity ?? undefined,
    };

    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Vehicle> {
    return prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}

export const vehicleRepository = new PrismaVehicleRepository();
