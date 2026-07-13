import { expenseRepository } from "@/server/repositories/expense-repository";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseWithRelations,
} from "@/server/repositories/expense-repository";
import { ValidationError, NotFoundError } from "@/server/errors";

export type CreateExpenseData = Omit<CreateExpenseInput, "userId">;
export type UpdateExpenseData = UpdateExpenseInput;

export class ExpenseService {
  async create(userId: string, input: CreateExpenseData): Promise<ExpenseWithRelations> {
    this.validate(input);
    return expenseRepository.create({ ...input, userId });
  }

  async list(userId: string): Promise<ExpenseWithRelations[]> {
    return expenseRepository.findByUser(userId);
  }

  async get(id: string): Promise<ExpenseWithRelations | null> {
    return expenseRepository.findById(id);
  }

  async update(id: string, userId: string, input: UpdateExpenseData): Promise<ExpenseWithRelations> {
    this.validate(input);
    const existing = await expenseRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Gasto");
    }
    return expenseRepository.update(id, input);
  }

  async delete(id: string, userId: string): Promise<ExpenseWithRelations> {
    const existing = await expenseRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Gasto");
    }
    return expenseRepository.softDelete(id);
  }

  private validate(input: Partial<CreateExpenseInput>) {
    if (input.amount !== undefined && Number(input.amount) <= 0) {
      throw new ValidationError("El monto debe ser mayor a cero.");
    }
  }
}

export const expenseService = new ExpenseService();
