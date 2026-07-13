import type { VehicleOption } from "@/shared/types/vehicle";

export function formatVehicleLabel(vehicle: VehicleOption): string {
  return `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`;
}
