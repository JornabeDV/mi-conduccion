import { workShiftRepository } from "@/server/repositories/workshift-repository";
import type {
  CreateWorkShiftInput,
  UpdateWorkShiftInput,
  WorkShiftWithRelations,
} from "@/server/repositories/workshift-repository";
import { Decimal } from "@prisma/client/runtime/library";
import { ValidationError, NotFoundError } from "@/server/errors";

function toDecimal(value: number | Decimal | null | undefined): Decimal {
  if (value instanceof Decimal) return value;
  return value === null || value === undefined ? new Decimal(0) : new Decimal(value);
}

export type WorkShiftSummary = {
  id: string;
  date: Date;
  startedAt: Date;
  endedAt: Date | null;
  onlineHours: number | null;
  totalTrips: number;
  distanceKm: number | null;
  notes: string | null;
  vehicleName: string | null;
  totalIncome: number;
};

export type CreateWorkShiftData = Omit<CreateWorkShiftInput, "userId">;
export type UpdateWorkShiftData = UpdateWorkShiftInput;

export class WorkShiftService {
  async create(userId: string, input: CreateWorkShiftData) {
    this.validate(input);
    return workShiftRepository.create({ ...input, userId });
  }

  async list(userId: string): Promise<WorkShiftSummary[]> {
    const shifts = await workShiftRepository.findByUser(userId);
    return shifts.map((shift) => {
      const totalIncome = shift.incomes.reduce(
        (sum, income) => sum.plus(toDecimal(income.amount)),
        new Decimal(0)
      );
      return {
        id: shift.id,
        date: shift.date,
        startedAt: shift.startedAt,
        endedAt: shift.endedAt,
        onlineHours: shift.onlineHours ? Number(shift.onlineHours) : null,
        totalTrips: shift.totalTrips,
        distanceKm: shift.distanceKm ? Number(shift.distanceKm) : null,
        notes: shift.notes,
        vehicleName: shift.vehicle ? `${shift.vehicle.brand} ${shift.vehicle.model}` : null,
        totalIncome: Number(totalIncome),
      };
    });
  }

  async get(id: string): Promise<WorkShiftWithRelations | null> {
    return workShiftRepository.findById(id);
  }

  async update(id: string, userId: string, input: UpdateWorkShiftData) {
    this.validate(input);
    const existing = await workShiftRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Jornada");
    }
    return workShiftRepository.update(id, input);
  }

  async delete(id: string, userId: string) {
    const existing = await workShiftRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Jornada");
    }
    return workShiftRepository.softDelete(id);
  }

  private validate(input: Partial<CreateWorkShiftInput>) {
    if (input.endedAt && input.startedAt && new Date(input.endedAt) <= new Date(input.startedAt)) {
      throw new ValidationError("La hora de fin debe ser posterior a la hora de inicio.");
    }
    if (input.totalTrips !== undefined && input.totalTrips < 0) {
      throw new ValidationError("La cantidad de viajes no puede ser negativa.");
    }
    if (input.onlineHours !== undefined && input.onlineHours !== null && input.onlineHours < 0) {
      throw new ValidationError("Las horas en línea no pueden ser negativas.");
    }
    if (input.distanceKm !== undefined && input.distanceKm !== null && Number(input.distanceKm) < 0) {
      throw new ValidationError("La distancia no puede ser negativa.");
    }
  }
}

export const workShiftService = new WorkShiftService();
