import { fuelRepository } from "@/server/repositories/fuel-repository";
import { expenseRepository } from "@/server/repositories/expense-repository";
import type {
  CreateFuelInput,
  FuelLogWithRelations,
} from "@/server/repositories/fuel-repository";
import { ValidationError, NotFoundError } from "@/server/errors";

function round(value: number, decimals = 2) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

async function createFuelExpense(input: CreateFuelInput, userId: string) {
  return expenseRepository.create({
    userId,
    vehicleId: input.vehicleId,
    category: "FUEL",
    date: input.date,
    description: input.notes ? `Combustible - ${input.notes}` : "Carga de combustible",
    amount: input.totalAmount,
  });
}

async function computeMetrics(vehicleId: string, current: CreateFuelInput) {
  const previous = await fuelRepository.findPreviousByVehicle(vehicleId, current.date);
  if (!previous || !previous.fullTank || !current.fullTank) {
    return { consumptionLPer100Km: null, efficiencyKmPerL: null, costPerKm: null, estimatedRangeKm: null };
  }

  const distanceKm = Number(current.odometerKm) - Number(previous.odometerKm);
  const litersConsumed = Number(previous.liters);

  if (distanceKm <= 0 || litersConsumed <= 0) {
    return { consumptionLPer100Km: null, efficiencyKmPerL: null, costPerKm: null, estimatedRangeKm: null };
  }

  const consumptionLPer100Km = round((litersConsumed / distanceKm) * 100);
  const efficiencyKmPerL = round(distanceKm / litersConsumed);
  const costPerKm = round(Number(previous.totalAmount) / distanceKm);
  const estimatedRangeKm = round(efficiencyKmPerL * Number(current.liters));

  return { consumptionLPer100Km, efficiencyKmPerL, costPerKm, estimatedRangeKm };
}

export type CreateFuelData = Omit<CreateFuelInput, "userId" | "expenseId" | "consumptionLPer100Km" | "efficiencyKmPerL" | "costPerKm" | "estimatedRangeKm">;
export type UpdateFuelData = Partial<CreateFuelData>;

export class FuelService {
  async create(userId: string, input: CreateFuelData): Promise<FuelLogWithRelations> {
    this.validate(input);
    const createInput: CreateFuelInput = { ...input, userId, expenseId: null };
    const expense = await createFuelExpense(createInput, userId);
    const metrics = await computeMetrics(input.vehicleId, createInput);

    return fuelRepository.create({
      ...createInput,
      expenseId: expense.id,
      ...metrics,
    });
  }

  async list(userId: string): Promise<FuelLogWithRelations[]> {
    return fuelRepository.findByUser(userId);
  }

  async get(id: string): Promise<FuelLogWithRelations | null> {
    return fuelRepository.findById(id);
  }

  async update(id: string, userId: string, input: UpdateFuelData): Promise<FuelLogWithRelations> {
    this.validate(input);
    const existing = await fuelRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Carga de combustible");
    }

    const merged: CreateFuelInput = {
      userId: existing.userId,
      vehicleId: input.vehicleId ?? existing.vehicleId,
      date: input.date ?? existing.date,
      odometerKm: input.odometerKm ?? Number(existing.odometerKm),
      liters: input.liters ?? Number(existing.liters),
      pricePerLiter: input.pricePerLiter ?? Number(existing.pricePerLiter),
      totalAmount: input.totalAmount ?? Number(existing.totalAmount),
      fullTank: input.fullTank ?? existing.fullTank,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      expenseId: existing.expenseId,
    };

    const metrics = await computeMetrics(merged.vehicleId, merged);

    if (existing.expenseId) {
      await expenseRepository.update(existing.expenseId, {
        vehicleId: merged.vehicleId,
        date: merged.date,
        description: merged.notes ? `Combustible - ${merged.notes}` : "Carga de combustible",
        amount: merged.totalAmount,
      });
    }

    return fuelRepository.update(id, { ...input, ...metrics });
  }

  async delete(id: string, userId: string): Promise<FuelLogWithRelations> {
    const existing = await fuelRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Carga de combustible");
    }

    if (existing.expenseId) {
      await expenseRepository.softDelete(existing.expenseId);
    }

    return fuelRepository.softDelete(id);
  }

  private validate(input: Partial<CreateFuelInput>) {
    if (input.odometerKm !== undefined && Number(input.odometerKm) < 0) {
      throw new ValidationError("El odómetro no puede ser negativo.");
    }
    if (input.liters !== undefined && Number(input.liters) <= 0) {
      throw new ValidationError("Los litros deben ser mayores a cero.");
    }
    if (input.pricePerLiter !== undefined && Number(input.pricePerLiter) <= 0) {
      throw new ValidationError("El precio por litro debe ser mayor a cero.");
    }
    if (input.totalAmount !== undefined && Number(input.totalAmount) <= 0) {
      throw new ValidationError("El monto total debe ser mayor a cero.");
    }
    if (input.liters !== undefined && input.pricePerLiter !== undefined && input.totalAmount !== undefined) {
      const expected = round(Number(input.liters) * Number(input.pricePerLiter));
      const actual = round(Number(input.totalAmount));
      if (Math.abs(expected - actual) > 0.05) {
        throw new ValidationError("El monto total no coincide con litros × precio por litro.");
      }
    }
  }
}

export const fuelService = new FuelService();
