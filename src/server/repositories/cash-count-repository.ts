import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const cashCountInclude = {} satisfies Prisma.CashCountInclude;

export type CashCountWithRelations = Prisma.CashCountGetPayload<{
  include: typeof cashCountInclude;
}>;

export type CreateCashCountInput = {
  userId: string;
  shiftId: string;
  type: "OPEN" | "CLOSE";
  date: Date;
  denominations: Prisma.InputJsonValue;
  totalAmount: number;
  transferAmount?: number | null;
  appAmount?: number | null;
  extraAmount?: number | null;
  notes?: string | null;
};

export type UpdateCashCountInput = Partial<CreateCashCountInput>;

export interface CashCountRepository {
  create(input: CreateCashCountInput): Promise<CashCountWithRelations>;
  findById(id: string): Promise<CashCountWithRelations | null>;
  findByShift(shiftId: string): Promise<CashCountWithRelations[]>;
  findByShiftAndType(shiftId: string, type: "OPEN" | "CLOSE"): Promise<CashCountWithRelations | null>;
  update(id: string, input: UpdateCashCountInput): Promise<CashCountWithRelations>;
  softDelete(id: string): Promise<CashCountWithRelations>;
}

export class PrismaCashCountRepository implements CashCountRepository {
  async create(input: CreateCashCountInput): Promise<CashCountWithRelations> {
    return prisma.cashCount.create({
      data: {
        userId: input.userId,
        shiftId: input.shiftId,
        type: input.type,
        date: input.date,
        denominations: input.denominations,
        totalAmount: input.totalAmount,
        transferAmount: input.transferAmount ?? null,
        appAmount: input.appAmount ?? null,
        extraAmount: input.extraAmount ?? null,
        notes: input.notes ?? null,
        deletedAt: null,
      },
      include: cashCountInclude,
    });
  }

  async findById(id: string): Promise<CashCountWithRelations | null> {
    return prisma.cashCount.findFirst({
      where: { id, deletedAt: null },
      include: cashCountInclude,
    });
  }

  async findByShift(shiftId: string): Promise<CashCountWithRelations[]> {
    return prisma.cashCount.findMany({
      where: { shiftId, deletedAt: null },
      include: cashCountInclude,
      orderBy: { createdAt: "asc" },
    });
  }

  async findByShiftAndType(shiftId: string, type: "OPEN" | "CLOSE"): Promise<CashCountWithRelations | null> {
    return prisma.cashCount.findFirst({
      where: { shiftId, type, deletedAt: null },
      include: cashCountInclude,
    });
  }

  async update(id: string, input: UpdateCashCountInput): Promise<CashCountWithRelations> {
    return prisma.cashCount.update({
      where: { id },
      data: {
        date: input.date ?? undefined,
        denominations: input.denominations ?? undefined,
        totalAmount: input.totalAmount ?? undefined,
        transferAmount: input.transferAmount !== undefined ? input.transferAmount ?? null : undefined,
        appAmount: input.appAmount !== undefined ? input.appAmount ?? null : undefined,
        extraAmount: input.extraAmount !== undefined ? input.extraAmount ?? null : undefined,
        notes: input.notes !== undefined ? input.notes ?? null : undefined,
      },
      include: cashCountInclude,
    });
  }

  async softDelete(id: string): Promise<CashCountWithRelations> {
    return prisma.cashCount.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: cashCountInclude,
    });
  }
}

export const cashCountRepository = new PrismaCashCountRepository();
