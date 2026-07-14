import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const workShiftInclude = {
  incomes: true,
  vehicle: true,
} satisfies Prisma.WorkShiftInclude;

export type WorkShiftWithRelations = Prisma.WorkShiftGetPayload<{
  include: typeof workShiftInclude;
}>;

export type ShiftIncomeInput = {
  type: "PLATFORM" | "TIP" | "BONUS" | "OTHER";
  platform?: "UBER" | "CABIFY" | "DIDI" | "MAXIM" | "INDRIVE" | "OTHER" | null;
  amount: number;
  notes?: string | null;
};

export type CreateWorkShiftInput = {
  userId: string;
  vehicleId?: string | null;
  date: Date;
  startedAt: Date;
  endedAt?: Date | null;
  onlineHours?: number | null;
  totalTrips: number;
  distanceKm?: number | null;
  notes?: string | null;
  incomes: ShiftIncomeInput[];
};

export type UpdateWorkShiftInput = Partial<CreateWorkShiftInput>;

export interface WorkShiftRepository {
  create(input: CreateWorkShiftInput): Promise<WorkShiftWithRelations>;
  findById(id: string): Promise<WorkShiftWithRelations | null>;
  findByUser(userId: string): Promise<WorkShiftWithRelations[]>;
  findByUserVehicleAndDate(userId: string, vehicleId: string, date: Date): Promise<WorkShiftWithRelations | null>;
  update(id: string, input: UpdateWorkShiftInput): Promise<WorkShiftWithRelations>;
  softDelete(id: string): Promise<WorkShiftWithRelations>;
}

function toIncomeCreateManyInput(
  shiftId: string,
  incomes: ShiftIncomeInput[]
): Prisma.ShiftIncomeCreateManyInput[] {
  return incomes.map((income) => ({
    shiftId,
    type: income.type,
    platform: income.platform ?? null,
    amount: income.amount,
    notes: income.notes ?? null,
  }));
}

export class PrismaWorkShiftRepository implements WorkShiftRepository {
  async create(input: CreateWorkShiftInput): Promise<WorkShiftWithRelations> {
    return prisma.$transaction(async (tx) => {
      const shift = await tx.workShift.create({
        data: {
          userId: input.userId,
          vehicleId: input.vehicleId ?? null,
          date: input.date,
          startedAt: input.startedAt,
          endedAt: input.endedAt ?? null,
          onlineHours: input.onlineHours ?? null,
          totalTrips: input.totalTrips,
          distanceKm: input.distanceKm ?? null,
          notes: input.notes ?? null,
          deletedAt: null,
        },
      });

      if (input.incomes.length > 0) {
        await tx.shiftIncome.createMany({
          data: toIncomeCreateManyInput(shift.id, input.incomes),
        });
      }

      return tx.workShift.findUniqueOrThrow({
        where: { id: shift.id },
        include: workShiftInclude,
      });
    });
  }

  async findById(id: string): Promise<WorkShiftWithRelations | null> {
    return prisma.workShift.findFirst({
      where: { id, deletedAt: null },
      include: workShiftInclude,
    });
  }

  async findByUser(userId: string): Promise<WorkShiftWithRelations[]> {
    return prisma.workShift.findMany({
      where: { userId, deletedAt: null },
      include: workShiftInclude,
      orderBy: { date: "desc" },
    });
  }

  async findByUserVehicleAndDate(userId: string, vehicleId: string, date: Date): Promise<WorkShiftWithRelations | null> {
    return prisma.workShift.findFirst({
      where: { userId, vehicleId, date, deletedAt: null },
      include: workShiftInclude,
    });
  }

  async update(id: string, input: UpdateWorkShiftInput): Promise<WorkShiftWithRelations> {
    return prisma.$transaction(async (tx) => {
      const shift = await tx.workShift.update({
        where: { id },
        data: {
          vehicleId: input.vehicleId !== undefined ? input.vehicleId ?? null : undefined,
          date: input.date ?? undefined,
          startedAt: input.startedAt ?? undefined,
          endedAt: input.endedAt !== undefined ? input.endedAt ?? null : undefined,
          onlineHours: input.onlineHours !== undefined ? input.onlineHours ?? null : undefined,
          totalTrips: input.totalTrips ?? undefined,
          distanceKm: input.distanceKm !== undefined ? input.distanceKm ?? null : undefined,
          notes: input.notes !== undefined ? input.notes ?? null : undefined,
        },
      });

      if (input.incomes) {
        await tx.shiftIncome.deleteMany({ where: { shiftId: id } });
        if (input.incomes.length > 0) {
          await tx.shiftIncome.createMany({
            data: toIncomeCreateManyInput(id, input.incomes),
          });
        }
      }

      return tx.workShift.findUniqueOrThrow({
        where: { id: shift.id },
        include: workShiftInclude,
      });
    });
  }

  async softDelete(id: string): Promise<WorkShiftWithRelations> {
    return prisma.workShift.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: workShiftInclude,
    });
  }
}

export const workShiftRepository = new PrismaWorkShiftRepository();
