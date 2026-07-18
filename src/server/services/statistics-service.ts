import { UTCDate } from "@date-fns/utc";
import { prisma } from "@/lib/prisma";
import {
  buildTimeline,
  formatRangeLabel,
  getRangeInterval,
  type StatisticsDto,
  type StatisticsGrouping,
  type StatisticsRange,
  type StatisticsVehiclePoint,
} from "@/server/dto/statistics";
import { EXPENSE_CATEGORY_LABELS } from "@/shared/constants/expense-categories";

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
}

export class StatisticsService {
  async getVehicleStatistics(
    userId: string,
    range: StatisticsRange = "3m",
    grouping: StatisticsGrouping = "week",
  ): Promise<StatisticsDto> {
    const { start, end } = getRangeInterval(range);

    const [vehicles, shifts, expenses, fuelLogs] = await Promise.all([
      prisma.vehicle.findMany({ where: { userId, deletedAt: null } }),
      prisma.workShift.findMany({
        where: {
          userId,
          deletedAt: null,
          date: { gte: start, lte: end },
        },
        include: { incomes: true, vehicle: true },
      }),
      prisma.expense.findMany({
        where: {
          userId,
          deletedAt: null,
          date: { gte: start, lte: end },
        },
        include: { vehicle: true },
      }),
      prisma.fuelLog.findMany({
        where: {
          userId,
          deletedAt: null,
          date: { gte: start, lte: end },
        },
        include: { vehicle: true },
      }),
    ]);

    const vehiclesStats: StatisticsVehiclePoint[] = vehicles.map((vehicle) => {
      const vehicleShifts = shifts.filter((s) => s.vehicleId === vehicle.id);
      const vehicleExpenses = expenses.filter((e) => e.vehicleId === vehicle.id);
      const vehicleFuelLogs = fuelLogs.filter((f) => f.vehicleId === vehicle.id);

      const timelineShifts = vehicleShifts.map((s) => ({
        date: s.date,
        distanceKm: toNumber(s.distanceKm),
        income: s.incomes.reduce((sum, i) => sum + toNumber(i.amount), 0),
      }));

      const timelineExpenses = vehicleExpenses.map((e) => ({
        date: e.date,
        amount: toNumber(e.amount),
      }));

      const timeline = buildTimeline(grouping, start, end, timelineShifts, timelineExpenses);

      const totalExpenses = vehicleExpenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
      const categoryTotals = new Map<string, number>();
      for (const expense of vehicleExpenses) {
        categoryTotals.set(expense.category, (categoryTotals.get(expense.category) ?? 0) + toNumber(expense.amount));
      }
      const expenseDistribution = Array.from(categoryTotals.entries())
        .map(([category, amount]) => ({
          category: EXPENSE_CATEGORY_LABELS[category as keyof typeof EXPENSE_CATEGORY_LABELS] ?? category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      const fullTankLogs = vehicleFuelLogs.filter((f) => f.fullTank && f.efficiencyKmPerL);
      const fuelEfficiency =
        fullTankLogs.length > 0
          ? fullTankLogs.reduce((sum, f) => sum + toNumber(f.efficiencyKmPerL), 0) / fullTankLogs.length
          : null;

      return {
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.brand} ${vehicle.model}`,
        timeline,
        expenseDistribution,
        fuelEfficiency,
      };
    });

    return {
      range,
      grouping,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      vehicles: vehiclesStats,
    };
  }
}

export const statisticsService = new StatisticsService();
export { formatRangeLabel };
