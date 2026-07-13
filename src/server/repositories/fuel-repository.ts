import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const fuelInclude = {
  vehicle: true,
  expense: true,
} satisfies Prisma.FuelLogInclude;

export type FuelLogWithRelations = Prisma.FuelLogGetPayload<{
  include: typeof fuelInclude;
}>;

export type CreateFuelInput = {
  userId: string;
  vehicleId: string;
  date: Date;
  odometerKm: number;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  fullTank: boolean;
  notes?: string | null;
  expenseId?: string | null;
  consumptionLPer100Km?: number | null;
  efficiencyKmPerL?: number | null;
  costPerKm?: number | null;
  estimatedRangeKm?: number | null;
};

export type UpdateFuelInput = Partial<CreateFuelInput>;

export interface FuelRepository {
  create(input: CreateFuelInput): Promise<FuelLogWithRelations>;
  findById(id: string): Promise<FuelLogWithRelations | null>;
  findByUser(userId: string): Promise<FuelLogWithRelations[]>;
  findPreviousByVehicle(vehicleId: string, beforeDate: Date): Promise<FuelLogWithRelations | null>;
  update(id: string, input: UpdateFuelInput): Promise<FuelLogWithRelations>;
  softDelete(id: string): Promise<FuelLogWithRelations>;
}

export class PrismaFuelRepository implements FuelRepository {
  async create(input: CreateFuelInput): Promise<FuelLogWithRelations> {
    return prisma.fuelLog.create({
      data: {
        userId: input.userId,
        vehicleId: input.vehicleId,
        date: input.date,
        odometerKm: input.odometerKm,
        liters: input.liters,
        pricePerLiter: input.pricePerLiter,
        totalAmount: input.totalAmount,
        fullTank: input.fullTank,
        notes: input.notes ?? null,
        expenseId: input.expenseId ?? null,
        consumptionLPer100Km: input.consumptionLPer100Km ?? null,
        efficiencyKmPerL: input.efficiencyKmPerL ?? null,
        costPerKm: input.costPerKm ?? null,
        estimatedRangeKm: input.estimatedRangeKm ?? null,
      },
      include: fuelInclude,
    });
  }

  async findById(id: string): Promise<FuelLogWithRelations | null> {
    return prisma.fuelLog.findFirst({
      where: { id, deletedAt: null },
      include: fuelInclude,
    });
  }

  async findByUser(userId: string): Promise<FuelLogWithRelations[]> {
    return prisma.fuelLog.findMany({
      where: { userId, deletedAt: null },
      include: fuelInclude,
      orderBy: { date: "desc" },
    });
  }

  async findPreviousByVehicle(vehicleId: string, beforeDate: Date): Promise<FuelLogWithRelations | null> {
    return prisma.fuelLog.findFirst({
      where: { vehicleId, deletedAt: null, date: { lt: beforeDate } },
      orderBy: { date: "desc" },
      include: fuelInclude,
    });
  }

  async update(id: string, input: UpdateFuelInput): Promise<FuelLogWithRelations> {
    return prisma.fuelLog.update({
      where: { id },
      data: {
        vehicleId: input.vehicleId ?? undefined,
        date: input.date ?? undefined,
        odometerKm: input.odometerKm ?? undefined,
        liters: input.liters ?? undefined,
        pricePerLiter: input.pricePerLiter ?? undefined,
        totalAmount: input.totalAmount ?? undefined,
        fullTank: input.fullTank !== undefined ? input.fullTank : undefined,
        notes: input.notes !== undefined ? input.notes ?? null : undefined,
        expenseId: input.expenseId !== undefined ? input.expenseId ?? null : undefined,
        consumptionLPer100Km: input.consumptionLPer100Km !== undefined ? input.consumptionLPer100Km ?? null : undefined,
        efficiencyKmPerL: input.efficiencyKmPerL !== undefined ? input.efficiencyKmPerL ?? null : undefined,
        costPerKm: input.costPerKm !== undefined ? input.costPerKm ?? null : undefined,
        estimatedRangeKm: input.estimatedRangeKm !== undefined ? input.estimatedRangeKm ?? null : undefined,
      },
      include: fuelInclude,
    });
  }

  async softDelete(id: string): Promise<FuelLogWithRelations> {
    return prisma.fuelLog.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: fuelInclude,
    });
  }
}

export const fuelRepository = new PrismaFuelRepository();
