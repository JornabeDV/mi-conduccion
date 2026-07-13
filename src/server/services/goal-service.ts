import { goalRepository } from "@/server/repositories/goal-repository";
import type {
  CreateGoalInput,
  UpdateGoalInput,
} from "@/server/repositories/goal-repository";
import { workShiftRepository } from "@/server/repositories/workshift-repository";
import { ValidationError, NotFoundError } from "@/server/errors";
import { startOfDay, endOfDay, endOfWeek, endOfMonth } from "date-fns";

export type CreateGoalData = Omit<CreateGoalInput, "userId">;
export type UpdateGoalData = UpdateGoalInput;

export type GoalProgress = {
  id: string;
  period: "DAILY" | "WEEKLY" | "MONTHLY";
  targetAmount: number;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  currentAmount: number;
  percentage: number;
  remaining: number;
};

function getPeriodEnd(startDate: Date, period: "DAILY" | "WEEKLY" | "MONTHLY"): Date {
  if (period === "DAILY") return endOfDay(startDate);
  if (period === "WEEKLY") return endOfWeek(startDate, { weekStartsOn: 1 });
  return endOfMonth(startDate);
}

async function calculateProgress(
  userId: string,
  goal: { period: "DAILY" | "WEEKLY" | "MONTHLY"; startDate: Date; endDate: Date | null; targetAmount: number | import("@prisma/client/runtime/library").Decimal }
): Promise<Omit<GoalProgress, "id" | "isActive">> {
  const start = startOfDay(goal.startDate);
  const end = goal.endDate ? endOfDay(goal.endDate) : getPeriodEnd(start, goal.period);

  const shifts = await workShiftRepository.findByUser(userId);
  const currentAmount = shifts
    .filter((shift) => {
      const d = startOfDay(shift.date);
      return d >= start && d <= end;
    })
    .flatMap((shift) => shift.incomes)
    .reduce((sum, income) => sum + Number(income.amount), 0);

  const target = Number(goal.targetAmount);
  const percentage = target > 0 ? Math.min(100, (currentAmount / target) * 100) : 0;
  const remaining = Math.max(0, target - currentAmount);

  return { period: goal.period, targetAmount: target, startDate: goal.startDate, endDate: goal.endDate, currentAmount, percentage, remaining };
}

export class GoalService {
  async create(userId: string, input: CreateGoalData): Promise<GoalProgress> {
    this.validate(input);
    const goal = await goalRepository.create({ ...input, userId });
    const progress = await calculateProgress(userId, goal);
    return { id: goal.id, isActive: goal.isActive, ...progress };
  }

  async list(userId: string): Promise<GoalProgress[]> {
    const goals = await goalRepository.findByUser(userId);
    return Promise.all(
      goals.map(async (goal) => {
        const progress = await calculateProgress(userId, goal);
        return { id: goal.id, isActive: goal.isActive, ...progress };
      })
    );
  }

  async get(id: string, userId: string): Promise<GoalProgress | null> {
    const goal = await goalRepository.findById(id);
    if (!goal || goal.userId !== userId) return null;
    const progress = await calculateProgress(userId, goal);
    return { id: goal.id, isActive: goal.isActive, ...progress };
  }

  async update(id: string, userId: string, input: UpdateGoalData): Promise<GoalProgress> {
    this.validate(input);
    const existing = await goalRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Objetivo");
    }
    const goal = await goalRepository.update(id, input);
    const progress = await calculateProgress(userId, goal);
    return { id: goal.id, isActive: goal.isActive, ...progress };
  }

  async delete(id: string, userId: string) {
    const existing = await goalRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Objetivo");
    }
    return goalRepository.delete(id);
  }

  private validate(input: Partial<CreateGoalInput>) {
    if (input.targetAmount !== undefined && Number(input.targetAmount) <= 0) {
      throw new ValidationError("El objetivo debe ser mayor a cero.");
    }
    if (input.startDate && input.endDate && new Date(input.endDate) < startOfDay(new Date(input.startDate))) {
      throw new ValidationError("La fecha de fin no puede ser anterior a la de inicio.");
    }
  }
}

export const goalService = new GoalService();
