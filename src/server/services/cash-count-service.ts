import { Decimal } from "@prisma/client/runtime/library";
import { cashCountRepository } from "@/server/repositories/cash-count-repository";
import { workShiftRepository } from "@/server/repositories/workshift-repository";
import { NotFoundError } from "@/server/errors";
import type { CashCountCreateInput } from "@/server/validators/cash-count";
import type { CashCountWithRelations, CreateCashCountInput as RepositoryCreateCashCountInput } from "@/server/repositories/cash-count-repository";

function toDecimal(value: number | Decimal | null | undefined): Decimal {
  if (value instanceof Decimal) return value;
  return value === null || value === undefined ? new Decimal(0) : new Decimal(value);
}

function calculateTotal(denominations: { value: number; quantity: number }[]): number {
  return denominations.reduce((sum, d) => sum + d.value * d.quantity, 0);
}

export type CashCountSummary = {
  open: CashCountWithRelations | null;
  close: CashCountWithRelations | null;
  openTotal: number;
  closeTotal: number;
  openTransfer: number;
  closeTransfer: number;
  openApp: number;
  closeApp: number;
  cashEarnings: number;
  transferEarnings: number;
  appEarnings: number;
  extraAmount: number;
  cashBalance: number;
  totalBalance: number;
};

export class CashCountService {
  async createOpening(
    userId: string,
    input: {
      vehicleId: string;
      date: Date;
      denominations: { value: number; quantity: number; label: string }[];
      transferAmount?: number | null;
      appAmount?: number | null;
      notes?: string | null;
    }
  ) {
    const totalAmount = calculateTotal(input.denominations);

    let shift = await workShiftRepository.findByUserVehicleAndDate(userId, input.vehicleId, input.date);

    if (!shift) {
      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      shift = await workShiftRepository.create({
        userId,
        vehicleId: input.vehicleId,
        date: input.date,
        startedAt: startOfDay,
        endedAt: null,
        onlineHours: null,
        totalTrips: 0,
        distanceKm: null,
        notes: null,
        incomes: [],
      });
    }

    const existing = await cashCountRepository.findByShiftAndType(shift.id, "OPEN");
    const repositoryInput: RepositoryCreateCashCountInput = {
      userId,
      shiftId: shift.id,
      type: "OPEN",
      date: input.date,
      denominations: input.denominations as unknown as Parameters<typeof cashCountRepository.create>[0]["denominations"],
      totalAmount,
      transferAmount: input.transferAmount ?? null,
      appAmount: input.appAmount ?? null,
      extraAmount: null,
      notes: input.notes ?? null,
    };

    if (existing) {
      return cashCountRepository.update(existing.id, repositoryInput);
    }

    return cashCountRepository.create(repositoryInput);
  }

  async save(userId: string, input: CashCountCreateInput) {
    const shift = await workShiftRepository.findById(input.shiftId);
    if (!shift || shift.userId !== userId) {
      throw new NotFoundError("Jornada");
    }

    const totalAmount = calculateTotal(input.denominations);
    const transferAmount = input.transferAmount ?? 0;
    const appAmount = input.appAmount ?? 0;
    const extraAmount = input.type === "CLOSE" ? (input.extraAmount ?? 0) : undefined;

    const existing = await cashCountRepository.findByShiftAndType(input.shiftId, input.type);

    const repositoryInput: RepositoryCreateCashCountInput = {
      userId,
      shiftId: input.shiftId,
      type: input.type,
      date: input.date,
      denominations: input.denominations as unknown as Parameters<typeof cashCountRepository.create>[0]["denominations"],
      totalAmount,
      transferAmount,
      appAmount,
      extraAmount,
      notes: input.notes,
    };

    if (existing) {
      return cashCountRepository.update(existing.id, repositoryInput);
    }

    return cashCountRepository.create(repositoryInput);
  }

  async getByShift(userId: string, shiftId: string): Promise<CashCountSummary> {
    const shift = await workShiftRepository.findById(shiftId);
    if (!shift || shift.userId !== userId) {
      throw new NotFoundError("Jornada");
    }

    const counts = await cashCountRepository.findByShift(shiftId);
    const open = counts.find((c) => c.type === "OPEN") ?? null;
    const close = counts.find((c) => c.type === "CLOSE") ?? null;

    const openTotal = Number(toDecimal(open?.totalAmount));
    const closeTotal = Number(toDecimal(close?.totalAmount));
    const openTransfer = Number(toDecimal(open?.transferAmount));
    const closeTransfer = Number(toDecimal(close?.transferAmount));
    const openApp = Number(toDecimal(open?.appAmount));
    const closeApp = Number(toDecimal(close?.appAmount));
    const extraAmount = close ? Number(toDecimal(close.extraAmount)) : 0;

    const cashEarnings = closeTotal - openTotal;
    const transferEarnings = closeTransfer - openTransfer;
    const appEarnings = closeApp - openApp;
    const cashBalance = cashEarnings + extraAmount;
    const totalBalance = cashBalance + transferEarnings + appEarnings;

    return {
      open,
      close,
      openTotal,
      closeTotal,
      openTransfer,
      closeTransfer,
      openApp,
      closeApp,
      cashEarnings,
      transferEarnings,
      appEarnings,
      extraAmount,
      cashBalance,
      totalBalance,
    };
  }

  async delete(id: string, userId: string) {
    const existing = await cashCountRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Conteo");
    }
    return cashCountRepository.softDelete(id);
  }
}

export const cashCountService = new CashCountService();
