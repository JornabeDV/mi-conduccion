import { driverProfileRepository } from "@/server/repositories/driver-profile-repository";
import type { DriverProfileUpdateInput } from "@/server/validators/driver-profile";

export class DriverProfileService {
  async get(userId: string) {
    return driverProfileRepository.findByUser(userId);
  }

  async update(userId: string, input: DriverProfileUpdateInput) {
    return driverProfileRepository.upsert(userId, input);
  }
}

export const driverProfileService = new DriverProfileService();
