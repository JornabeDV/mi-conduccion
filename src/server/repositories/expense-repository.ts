import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const expenseInclude = {
  vehicle: true,
  attachments: true,
} satisfies Prisma.ExpenseInclude;

export type ExpenseWithRelations = Prisma.ExpenseGetPayload<{
  include: typeof expenseInclude;
}>;

export type CreateExpenseInput = {
  userId: string;
  vehicleId?: string | null;
  shiftId?: string | null;
  category: "FUEL" | "TOLLS" | "WASH" | "INSURANCE" | "REGISTRATION" | "SERVICE" | "OIL_CHANGE" | "TIRES" | "PARTS" | "FINES" | "OTHER";
  date: Date;
  description: string;
  amount: number;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export interface ExpenseRepository {
  create(input: CreateExpenseInput): Promise<ExpenseWithRelations>;
  findById(id: string): Promise<ExpenseWithRelations | null>;
  findByUser(userId: string): Promise<ExpenseWithRelations[]>;
  update(id: string, input: UpdateExpenseInput): Promise<ExpenseWithRelations>;
  softDelete(id: string): Promise<ExpenseWithRelations>;
}

export class PrismaExpenseRepository implements ExpenseRepository {
  async create(input: CreateExpenseInput): Promise<ExpenseWithRelations> {
    return prisma.expense.create({
      data: {
        userId: input.userId,
        vehicleId: input.vehicleId ?? null,
        shiftId: input.shiftId ?? null,
        category: input.category,
        date: input.date,
        description: input.description,
        amount: input.amount,
        deletedAt: null,
      },
      include: expenseInclude,
    });
  }

  async findById(id: string): Promise<ExpenseWithRelations | null> {
    return prisma.expense.findFirst({
      where: { id, deletedAt: null },
      include: expenseInclude,
    });
  }

  async findByUser(userId: string): Promise<ExpenseWithRelations[]> {
    return prisma.expense.findMany({
      where: { userId, deletedAt: null },
      include: expenseInclude,
      orderBy: { date: "desc" },
    });
  }

  async update(id: string, input: UpdateExpenseInput): Promise<ExpenseWithRelations> {
    return prisma.expense.update({
      where: { id },
      data: {
        vehicleId: input.vehicleId !== undefined ? input.vehicleId ?? null : undefined,
        shiftId: input.shiftId !== undefined ? input.shiftId ?? null : undefined,
        category: input.category ?? undefined,
        date: input.date ?? undefined,
        description: input.description ?? undefined,
        amount: input.amount ?? undefined,
      },
      include: expenseInclude,
    });
  }

  async softDelete(id: string): Promise<ExpenseWithRelations> {
    return prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: expenseInclude,
    });
  }
}

export const expenseRepository = new PrismaExpenseRepository();
