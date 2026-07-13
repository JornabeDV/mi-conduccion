import type { Decimal } from "@prisma/client/runtime/library";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import type {
  DashboardDto,
  DashboardGoal,
} from "@/server/dto/dashboard";

function toNumber(value: Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

function sum(values: (number | null | undefined)[]): number {
  return values.reduce<number>((acc, value) => acc + (value ?? 0), 0);
}

export class DashboardService {
  async getDashboard(userId: string): Promise<DashboardDto> {
    const today = new Date();
    const startToday = startOfDay(today);
    const endToday = endOfDay(today);

    const start30Days = startOfDay(subDays(today, 29));
    const start12Months = startOfMonth(subMonths(today, 11));
    const startMonth = startOfMonth(today);
    const endMonth = endOfMonth(today);

    const [shifts, expenses, fuelLogs, allShifts, allExpenses, monthExpenses, goal] =
      await Promise.all([
        prisma.workShift.findMany({
          where: {
            userId,
            deletedAt: null,
            date: { gte: start30Days, lte: endToday },
          },
          include: { incomes: true },
        }),
        prisma.expense.findMany({
          where: {
            userId,
            deletedAt: null,
            date: { gte: start30Days, lte: endToday },
          },
        }),
        prisma.fuelLog.findMany({
          where: {
            userId,
            deletedAt: null,
            date: { gte: start30Days, lte: endToday },
          },
        }),
        prisma.workShift.findMany({
          where: {
            userId,
            deletedAt: null,
            date: { gte: start12Months, lte: endToday },
          },
          include: { incomes: true },
        }),
        prisma.expense.findMany({
          where: {
            userId,
            deletedAt: null,
            date: { gte: start12Months, lte: endToday },
          },
        }),
        prisma.expense.findMany({
          where: {
            userId,
            deletedAt: null,
            date: { gte: startMonth, lte: endMonth },
          },
        }),
        prisma.goal.findFirst({
          where: {
            userId,
            period: "DAILY",
            isActive: true,
            startDate: { lte: today },
            OR: [{ endDate: null }, { endDate: { gte: today } }],
          },
        }),
      ]);

    const todayShifts = shifts.filter((shift) =>
      isSameDay(shift.date, today)
    );

    const todayIncome = sum(
      todayShifts.flatMap((shift) =>
        shift.incomes.map((income) => toNumber(income.amount))
      )
    );

    const todayTrips = sum(todayShifts.map((shift) => shift.totalTrips));
    const todayHours = sum(
      todayShifts.map((shift) => toNumber(shift.onlineHours))
    );

    const todayExpenses = sum(
      expenses
        .filter((expense) => isSameDay(expense.date, today))
        .map((expense) => toNumber(expense.amount))
    );

    const todayFuel = sum(
      fuelLogs
        .filter((log) => isSameDay(log.date, today))
        .map((log) => toNumber(log.totalAmount))
    );

    const profit = todayIncome - todayExpenses;
    const margin = todayIncome > 0 ? (profit / todayIncome) * 100 : 0;
    const profitPerHour = todayHours > 0 ? profit / todayHours : 0;
    const incomePerTrip = todayTrips > 0 ? todayIncome / todayTrips : 0;

    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    }).map((date) => ({
      date: date.toISOString(),
      label: format(date, "dd/MM"),
      income: sum(
        shifts
          .filter((shift) => isSameDay(shift.date, date))
          .flatMap((shift) =>
            shift.incomes.map((income) => toNumber(income.amount))
          )
      ),
    }));

    const last30Days = eachDayOfInterval({
      start: subDays(today, 29),
      end: today,
    }).map((date) => ({
      date: date.toISOString(),
      label: format(date, "dd/MM"),
      income: sum(
        shifts
          .filter((shift) => isSameDay(shift.date, date))
          .flatMap((shift) =>
            shift.incomes.map((income) => toNumber(income.amount))
          )
      ),
    }));

    const months = eachMonthOfInterval({
      start: start12Months,
      end: today,
    });

    const monthlyProfit = months.map((month) => {
      const monthIncome = sum(
        allShifts
          .filter((shift) => isSameMonth(shift.date, month))
          .flatMap((shift) =>
            shift.incomes.map((income) => toNumber(income.amount))
          )
      );

      const monthExpensesTotal = sum(
        allExpenses
          .filter((expense) => isSameMonth(expense.date, month))
          .map((expense) => toNumber(expense.amount))
      );

      return {
        month: month.toISOString(),
        label: format(month, "MMM yyyy"),
        income: monthIncome,
        expenses: monthExpensesTotal,
        profit: monthIncome - monthExpensesTotal,
      };
    });

    const categoryTotals = new Map<string, number>();
    let totalMonthExpenses = 0;

    for (const expense of monthExpenses) {
      const amount = toNumber(expense.amount);
      categoryTotals.set(
        expense.category,
        (categoryTotals.get(expense.category) ?? 0) + amount
      );
      totalMonthExpenses += amount;
    }

    const expenseDistribution = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          totalMonthExpenses > 0
            ? (amount / totalMonthExpenses) * 100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    let dashboardGoal: DashboardGoal = null;

    if (goal) {
      const target = toNumber(goal.targetAmount);
      const percentage = target > 0 ? Math.min(100, (todayIncome / target) * 100) : 0;

      dashboardGoal = {
        targetAmount: target,
        currentAmount: todayIncome,
        percentage,
        remaining: Math.max(0, target - todayIncome),
      };
    }

    return {
      today: {
        income: todayIncome,
        expenses: todayExpenses,
        profit,
        hours: todayHours,
        trips: todayTrips,
        fuel: todayFuel,
        margin,
        profitPerHour,
        incomePerTrip,
      },
      goal: dashboardGoal,
      last7Days,
      last30Days,
      monthlyProfit,
      expenseDistribution,
    };
  }
}

export const dashboardService = new DashboardService();
