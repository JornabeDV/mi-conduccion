import { startOfYear, endOfYear, eachMonthOfInterval, isSameMonth } from "date-fns";
import { prisma } from "@/lib/prisma";

export type VehicleStatistics = {
  vehicleId: string;
  vehicleName: string;
  income: number;
  expenses: number;
  fuel: number;
  profit: number;
  distanceKm: number;
  hours: number;
  trips: number;
  avgIncomePerTrip: number;
  avgIncomePerHour: number;
  fuelEfficiency: number | null;
  costPerKm: number | null;
  monthly: {
    month: string;
    label: string;
    income: number;
    expenses: number;
    profit: number;
    distanceKm: number;
  }[];
};

export class StatisticsService {
  async getVehicleStatistics(userId: string, year?: number): Promise<VehicleStatistics[]> {
    const today = new Date();
    const targetYear = year ?? today.getFullYear();
    const start = startOfYear(new Date(targetYear, 0, 1));
    const end = endOfYear(new Date(targetYear, 0, 1));

    const [vehicles, shifts, expenses, fuelLogs] = await Promise.all([
      prisma.vehicle.findMany({ where: { userId, deletedAt: null } }),
      prisma.workShift.findMany({
        where: { userId, deletedAt: null, date: { gte: start, lte: end } },
        include: { incomes: true, vehicle: true },
      }),
      prisma.expense.findMany({
        where: { userId, deletedAt: null, date: { gte: start, lte: end } },
        include: { vehicle: true },
      }),
      prisma.fuelLog.findMany({
        where: { userId, deletedAt: null, date: { gte: start, lte: end } },
        include: { vehicle: true },
      }),
    ]);

    const months = eachMonthOfInterval({ start, end });

    return vehicles.map((vehicle) => {
      const vehicleShifts = shifts.filter((s) => s.vehicleId === vehicle.id);
      const vehicleExpenses = expenses.filter((e) => e.vehicleId === vehicle.id);
      const vehicleFuelLogs = fuelLogs.filter((f) => f.vehicleId === vehicle.id);

      const income = vehicleShifts.flatMap((s) => s.incomes).reduce((sum, i) => sum + Number(i.amount), 0);
      const expensesTotal = vehicleExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const fuelTotal = vehicleFuelLogs.reduce((sum, f) => sum + Number(f.totalAmount), 0);
      const profit = income - expensesTotal;
      const distanceKm = vehicleShifts.reduce((sum, s) => sum + Number(s.distanceKm ?? 0), 0);
      const hours = vehicleShifts.reduce((sum, s) => sum + Number(s.onlineHours ?? 0), 0);
      const trips = vehicleShifts.reduce((sum, s) => sum + s.totalTrips, 0);

      const fullTankLogs = vehicleFuelLogs.filter((f) => f.fullTank && f.efficiencyKmPerL);
      const fuelEfficiency = fullTankLogs.length > 0
        ? fullTankLogs.reduce((sum, f) => sum + Number(f.efficiencyKmPerL), 0) / fullTankLogs.length
        : null;
      const costPerKm = distanceKm > 0 ? fuelTotal / distanceKm : null;

      const monthly = months.map((month) => {
        const monthShifts = vehicleShifts.filter((s) => isSameMonth(s.date, month));
        const monthExpenses = vehicleExpenses.filter((e) => isSameMonth(e.date, month));
        const monthIncome = monthShifts.flatMap((s) => s.incomes).reduce((sum, i) => sum + Number(i.amount), 0);
        const monthExpensesTotal = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        return {
          month: month.toISOString(),
          label: month.toLocaleString("es-AR", { month: "short" }),
          income: monthIncome,
          expenses: monthExpensesTotal,
          profit: monthIncome - monthExpensesTotal,
          distanceKm: monthShifts.reduce((sum, s) => sum + Number(s.distanceKm ?? 0), 0),
        };
      });

      return {
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.brand} ${vehicle.model}`,
        income,
        expenses: expensesTotal,
        fuel: fuelTotal,
        profit,
        distanceKm,
        hours,
        trips,
        avgIncomePerTrip: trips > 0 ? income / trips : 0,
        avgIncomePerHour: hours > 0 ? income / hours : 0,
        fuelEfficiency,
        costPerKm,
        monthly,
      };
    });
  }
}

export const statisticsService = new StatisticsService();
