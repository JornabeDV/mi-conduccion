import { reminderRepository } from "@/server/repositories/reminder-repository";
import type {
  CreateReminderInput,
  UpdateReminderInput,
  ReminderWithRelations,
} from "@/server/repositories/reminder-repository";
import { ValidationError, NotFoundError } from "@/server/errors";

export type CreateReminderData = Omit<CreateReminderInput, "userId">;
export type UpdateReminderData = UpdateReminderInput;

export class ReminderService {
  async create(userId: string, input: CreateReminderData): Promise<ReminderWithRelations> {
    this.validate(input);
    return reminderRepository.create({ ...input, userId });
  }

  async list(userId: string): Promise<ReminderWithRelations[]> {
    return reminderRepository.findByUser(userId);
  }

  async get(id: string, userId: string): Promise<ReminderWithRelations | null> {
    const reminder = await reminderRepository.findById(id);
    if (!reminder || reminder.userId !== userId) return null;
    return reminder;
  }

  async update(id: string, userId: string, input: UpdateReminderData): Promise<ReminderWithRelations> {
    this.validate(input);
    const existing = await reminderRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Recordatorio");
    }
    return reminderRepository.update(id, input);
  }

  async complete(id: string, userId: string): Promise<ReminderWithRelations> {
    const existing = await reminderRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Recordatorio");
    }
    return reminderRepository.complete(id);
  }

  async delete(id: string, userId: string): Promise<ReminderWithRelations> {
    const existing = await reminderRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Recordatorio");
    }
    return reminderRepository.delete(id);
  }

  private validate(input: Partial<CreateReminderInput>) {
    if (input.title !== undefined && input.title.length < 2) {
      throw new ValidationError("El título es muy corto.");
    }
    if (input.type === "DATE" && input.dueDate === null) {
      throw new ValidationError("La fecha de vencimiento es obligatoria para recordatorios por fecha.");
    }
    if (input.type === "ODOMETER" && (input.dueOdometer === null || input.dueOdometer === undefined)) {
      throw new ValidationError("El odómetro de vencimiento es obligatorio para recordatorios por kilometraje.");
    }
  }
}

export const reminderService = new ReminderService();
