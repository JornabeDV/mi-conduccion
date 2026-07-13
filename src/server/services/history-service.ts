import { startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { prisma } from "@/lib/prisma";

export type HistoryItem = {
  id: string;
  type: "SHIFT" | "EXPENSE" | "FUEL";
  date: Date;
  vehicleName: string | null;
  description: string;
  amount: number;
  details: string;
};

export type HistoryFilters = {
  dateFrom?: Date;
  dateTo?: Date;
  vehicleId?: string;
  type?: "SHIFT" | "EXPENSE" | "FUEL";
};

export class HistoryService {
  async getHistory(userId: string, filters: HistoryFilters = {}): Promise<HistoryItem[]> {
    const [shifts, expenses, fuelLogs] = await Promise.all([
      prisma.workShift.findMany({
        where: { userId, deletedAt: null },
        include: { incomes: true, vehicle: true },
        orderBy: { date: "desc" },
      }),
      prisma.expense.findMany({
        where: { userId, deletedAt: null },
        include: { vehicle: true },
        orderBy: { date: "desc" },
      }),
      prisma.fuelLog.findMany({
        where: { userId, deletedAt: null },
        include: { vehicle: true },
        orderBy: { date: "desc" },
      }),
    ]);

    const items: HistoryItem[] = [];

    for (const shift of shifts) {
      if (filters.type && filters.type !== "SHIFT") continue;
      if (filters.vehicleId && shift.vehicleId !== filters.vehicleId) continue;
      if (!this.isInRange(shift.date, filters)) continue;

      const income = shift.incomes.reduce((sum, i) => sum + Number(i.amount), 0);
      items.push({
        id: shift.id,
        type: "SHIFT",
        date: shift.date,
        vehicleName: shift.vehicle ? `${shift.vehicle.brand} ${shift.vehicle.model}` : null,
        description: `Jornada (${shift.totalTrips} viajes)`,
        amount: income,
        details: shift.notes ?? "",
      });
    }

    for (const expense of expenses) {
      if (filters.type && filters.type !== "EXPENSE") continue;
      if (filters.vehicleId && expense.vehicleId !== filters.vehicleId) continue;
      if (!this.isInRange(expense.date, filters)) continue;

      items.push({
        id: expense.id,
        type: "EXPENSE",
        date: expense.date,
        vehicleName: expense.vehicle ? `${expense.vehicle.brand} ${expense.vehicle.model}` : null,
        description: expense.description,
        amount: -Number(expense.amount),
        details: "",
      });
    }

    for (const log of fuelLogs) {
      if (filters.type && filters.type !== "FUEL") continue;
      if (filters.vehicleId && log.vehicleId !== filters.vehicleId) continue;
      if (!this.isInRange(log.date, filters)) continue;

      items.push({
        id: log.id,
        type: "FUEL",
        date: log.date,
        vehicleName: log.vehicle ? `${log.vehicle.brand} ${log.vehicle.model}` : null,
        description: `Combustible - ${log.liters} L`,
        amount: -Number(log.totalAmount),
        details: log.notes ?? "",
      });
    }

    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private isInRange(date: Date, filters: HistoryFilters): boolean {
    if (filters.dateFrom && filters.dateTo) {
      return isWithinInterval(date, { start: startOfDay(filters.dateFrom), end: endOfDay(filters.dateTo) });
    }
    if (filters.dateFrom) {
      return date >= startOfDay(filters.dateFrom);
    }
    if (filters.dateTo) {
      return date <= endOfDay(filters.dateTo);
    }
    return true;
  }
}

export const historyService = new HistoryService();
