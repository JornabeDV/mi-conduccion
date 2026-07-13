import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { prisma } from "@/lib/prisma";

export type CalendarDay = {
  date: Date;
  income: number;
  expenses: number;
  fuel: number;
  profit: number;
  hasEvents: boolean;
};

export class CalendarService {
  async getMonth(userId: string, year: number, month: number): Promise<CalendarDay[]> {
    const reference = new Date(year, month - 1, 1);
    const start = startOfMonth(reference);
    const end = endOfMonth(reference);

    const [shifts, expenses, fuelLogs] = await Promise.all([
      prisma.workShift.findMany({
        where: { userId, deletedAt: null, date: { gte: start, lte: end } },
        include: { incomes: true },
      }),
      prisma.expense.findMany({
        where: { userId, deletedAt: null, date: { gte: start, lte: end } },
      }),
      prisma.fuelLog.findMany({
        where: { userId, deletedAt: null, date: { gte: start, lte: end } },
      }),
    ]);

    const days = eachDayOfInterval({ start, end });

    return days.map((date) => {
      const dayShifts = shifts.filter((s) => isSameDay(s.date, date));
      const dayExpenses = expenses.filter((e) => isSameDay(e.date, date));
      const dayFuel = fuelLogs.filter((f) => isSameDay(f.date, date));

      const income = dayShifts.flatMap((s) => s.incomes).reduce((sum, i) => sum + Number(i.amount), 0);
      const expensesTotal = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const fuelTotal = dayFuel.reduce((sum, f) => sum + Number(f.totalAmount), 0);

      return {
        date,
        income,
        expenses: expensesTotal,
        fuel: fuelTotal,
        profit: income - expensesTotal,
        hasEvents: dayShifts.length > 0 || dayExpenses.length > 0 || dayFuel.length > 0,
      };
    });
  }
}

export const calendarService = new CalendarService();
