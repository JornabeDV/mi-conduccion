import { prisma } from "@/lib/prisma";
import type { Goal } from "@prisma/client";

export type CreateGoalInput = {
  userId: string;
  period: "DAILY" | "WEEKLY" | "MONTHLY";
  targetAmount: number;
  startDate: Date;
  endDate?: Date | null;
  isActive?: boolean;
};

export type UpdateGoalInput = Partial<CreateGoalInput>;

export interface GoalRepository {
  create(input: CreateGoalInput): Promise<Goal>;
  findById(id: string): Promise<Goal | null>;
  findByUser(userId: string): Promise<Goal[]>;
  update(id: string, input: UpdateGoalInput): Promise<Goal>;
  delete(id: string): Promise<Goal>;
}

export class PrismaGoalRepository implements GoalRepository {
  async create(input: CreateGoalInput): Promise<Goal> {
    return prisma.goal.create({
      data: {
        userId: input.userId,
        period: input.period,
        targetAmount: input.targetAmount,
        startDate: input.startDate,
        endDate: input.endDate ?? null,
        isActive: input.isActive ?? true,
      },
    });
  }

  async findById(id: string): Promise<Goal | null> {
    return prisma.goal.findFirst({
      where: { id },
    });
  }

  async findByUser(userId: string): Promise<Goal[]> {
    return prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, input: UpdateGoalInput): Promise<Goal> {
    return prisma.goal.update({
      where: { id },
      data: {
        period: input.period ?? undefined,
        targetAmount: input.targetAmount ?? undefined,
        startDate: input.startDate ?? undefined,
        endDate: input.endDate !== undefined ? input.endDate ?? null : undefined,
        isActive: input.isActive !== undefined ? input.isActive : undefined,
      },
    });
  }

  async delete(id: string): Promise<Goal> {
    return prisma.goal.delete({
      where: { id },
    });
  }
}

export const goalRepository = new PrismaGoalRepository();
