import { workShiftRepository } from "@/server/repositories/workshift-repository";
import type {
  CreateWorkShiftInput,
  UpdateWorkShiftInput,
  WorkShiftWithRelations,
} from "@/server/repositories/workshift-repository";
import { Decimal } from "@prisma/client/runtime/library";
import { ValidationError, NotFoundError } from "@/server/errors";
import type {
  WorkShiftCreateInput as WorkShiftFormInput,
  WorkShiftUpdateInput as WorkShiftFormUpdateInput,
} from "@/server/validators/workshift";

function toDecimal(value: number | Decimal | null | undefined): Decimal {
  if (value instanceof Decimal) return value;
  return value === null || value === undefined ? new Decimal(0) : new Decimal(value);
}

function parseTimeToDate(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function calculateTimestamps(input: {
  date: Date;
  startTime: string;
  endTime?: string | null;
}): { startedAt: Date; endedAt: Date | null } {
  const startedAt = parseTimeToDate(input.date, input.startTime);

  if (!input.endTime) {
    return { startedAt, endedAt: null };
  }

  let endedAt = parseTimeToDate(input.date, input.endTime);

  if (endedAt <= startedAt) {
    endedAt.setDate(endedAt.getDate() + 1);
  }

  return { startedAt, endedAt };
}

function calculateOnlineHours(
  startedAt: Date,
  endedAt: Date | null,
  providedHours: number | null | undefined
): number | null {
  if (providedHours !== undefined && providedHours !== null) {
    return providedHours;
  }

  if (!endedAt) {
    return null;
  }

  const diffMs = endedAt.getTime() - startedAt.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100;
}

function toRepositoryInput(
  input: WorkShiftFormInput | WorkShiftFormUpdateInput
): CreateWorkShiftInput | UpdateWorkShiftInput {
  const base = {
    vehicleId: input.vehicleId,
    date: input.date,
    totalTrips: input.totalTrips,
    distanceKm: input.distanceKm,
    notes: input.notes,
    incomes: input.incomes,
  };

  if (input.startTime === undefined) {
    return {
      ...base,
      onlineHours: input.onlineHours,
    };
  }

  const date = input.date ?? new Date();
  const { startedAt, endedAt } = calculateTimestamps({
    date,
    startTime: input.startTime,
    endTime: input.endTime,
  });

  const onlineHours =
    input.onlineHours !== undefined
      ? calculateOnlineHours(startedAt, endedAt, input.onlineHours)
      : undefined;

  return {
    ...base,
    startedAt,
    endedAt,
    onlineHours,
  };
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

export class WorkShiftService {
  async create(userId: string, input: WorkShiftFormInput) {
    const repositoryInput = toRepositoryInput(input) as CreateWorkShiftInput;
    this.validate(repositoryInput);
    return workShiftRepository.create({ ...repositoryInput, userId });
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

  async update(id: string, userId: string, input: WorkShiftFormUpdateInput) {
    const existing = await workShiftRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Jornada");
    }

    const repositoryInput = toRepositoryInput(input) as UpdateWorkShiftInput;

    const mergedStartedAt = repositoryInput.startedAt ?? existing.startedAt;
    const mergedEndedAt =
      repositoryInput.endedAt !== undefined
        ? repositoryInput.endedAt
        : existing.endedAt;

    this.validate({
      ...repositoryInput,
      startedAt: mergedStartedAt,
      endedAt: mergedEndedAt,
    });

    return workShiftRepository.update(id, repositoryInput);
  }

  async delete(id: string, userId: string) {
    const existing = await workShiftRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Jornada");
    }
    return workShiftRepository.softDelete(id);
  }

  private validate(input: Partial<CreateWorkShiftInput>) {
    if (input.endedAt && input.startedAt && input.endedAt <= input.startedAt) {
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
