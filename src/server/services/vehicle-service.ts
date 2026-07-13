import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
} from "@/server/repositories/vehicle-repository";
import { ValidationError, NotFoundError } from "@/server/errors";

export type CreateVehicleData = Omit<CreateVehicleInput, "userId">;
export type UpdateVehicleData = UpdateVehicleInput;

export class VehicleService {
  async create(userId: string, input: CreateVehicleData) {
    this.validate(input);
    return vehicleRepository.create({ ...input, userId });
  }

  async list(userId: string) {
    return vehicleRepository.findByUser(userId);
  }

  async listActive(userId: string) {
    return vehicleRepository.findActiveByUser(userId);
  }

  async get(id: string) {
    return vehicleRepository.findById(id);
  }

  async update(id: string, userId: string, input: UpdateVehicleData) {
    this.validate(input);
    const existing = await vehicleRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Vehículo");
    }
    return vehicleRepository.update(id, input);
  }

  async delete(id: string, userId: string) {
    const existing = await vehicleRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Vehículo");
    }
    return vehicleRepository.softDelete(id);
  }

  private validate(input: Partial<CreateVehicleInput>) {
    if (input.brand !== undefined && input.brand.length < 2) {
      throw new ValidationError("La marca debe tener al menos 2 caracteres.");
    }
    if (input.model !== undefined && input.model.length < 2) {
      throw new ValidationError("El modelo debe tener al menos 2 caracteres.");
    }
    if (input.licensePlate !== undefined && input.licensePlate.length < 2) {
      throw new ValidationError("La patente es obligatoria.");
    }
    if (input.currentKm !== undefined && Number(input.currentKm) < 0) {
      throw new ValidationError("El kilometraje no puede ser negativo.");
    }
    if (input.year !== undefined && input.year !== null) {
      if (input.year < 1900 || input.year > 2100) {
        throw new ValidationError("El año no es válido.");
      }
    }
    if (input.tankCapacity !== undefined && input.tankCapacity !== null && Number(input.tankCapacity) <= 0) {
      throw new ValidationError("La capacidad del tanque debe ser mayor a cero.");
    }
  }
}

export const vehicleService = new VehicleService();
