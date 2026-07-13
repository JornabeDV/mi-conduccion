import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const reminderInclude = {
  vehicle: true,
} satisfies Prisma.ReminderInclude;

export type ReminderWithRelations = Prisma.ReminderGetPayload<{
  include: typeof reminderInclude;
}>;

export type CreateReminderInput = {
  userId: string;
  vehicleId: string;
  type: "DATE" | "ODOMETER";
  entity: "OIL_CHANGE" | "FILTER" | "INSURANCE" | "VTV" | "REGISTRATION" | "TIRES" | "SERVICE" | "OTHER";
  title: string;
  dueDate?: Date | null;
  dueOdometer?: number | null;
  notes?: string | null;
};

export type UpdateReminderInput = Partial<CreateReminderInput>;

export interface ReminderRepository {
  create(input: CreateReminderInput): Promise<ReminderWithRelations>;
  findById(id: string): Promise<ReminderWithRelations | null>;
  findByUser(userId: string): Promise<ReminderWithRelations[]>;
  update(id: string, input: UpdateReminderInput): Promise<ReminderWithRelations>;
  delete(id: string): Promise<ReminderWithRelations>;
}

export class PrismaReminderRepository implements ReminderRepository {
  async create(input: CreateReminderInput): Promise<ReminderWithRelations> {
    return prisma.reminder.create({
      data: {
        userId: input.userId,
        vehicleId: input.vehicleId,
        type: input.type,
        entity: input.entity,
        title: input.title,
        dueDate: input.dueDate ?? null,
        dueOdometer: input.dueOdometer ?? null,
        notes: input.notes ?? null,
      },
      include: reminderInclude,
    });
  }

  async findById(id: string): Promise<ReminderWithRelations | null> {
    return prisma.reminder.findFirst({
      where: { id },
      include: reminderInclude,
    });
  }

  async findByUser(userId: string): Promise<ReminderWithRelations[]> {
    return prisma.reminder.findMany({
      where: { userId },
      include: reminderInclude,
      orderBy: [{ isCompleted: "asc" }, { dueDate: "asc" }],
    });
  }

  async update(id: string, input: UpdateReminderInput): Promise<ReminderWithRelations> {
    return prisma.reminder.update({
      where: { id },
      data: {
        vehicleId: input.vehicleId ?? undefined,
        type: input.type ?? undefined,
        entity: input.entity ?? undefined,
        title: input.title ?? undefined,
        dueDate: input.dueDate !== undefined ? input.dueDate ?? null : undefined,
        dueOdometer: input.dueOdometer !== undefined ? input.dueOdometer ?? null : undefined,
        notes: input.notes !== undefined ? input.notes ?? null : undefined,
      },
      include: reminderInclude,
    });
  }

  async complete(id: string): Promise<ReminderWithRelations> {
    return prisma.reminder.update({
      where: { id },
      data: { isCompleted: true, completedAt: new Date() },
      include: reminderInclude,
    });
  }

  async delete(id: string): Promise<ReminderWithRelations> {
    return prisma.reminder.delete({
      where: { id },
      include: reminderInclude,
    });
  }
}

export const reminderRepository = new PrismaReminderRepository();
