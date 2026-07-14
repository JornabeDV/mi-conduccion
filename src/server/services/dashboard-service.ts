import type { Decimal } from "@prisma/client/runtime/library";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { UTCDate } from "@date-fns/utc";
import { prisma } from "@/lib/prisma";
import type {
  DashboardDto,
  DashboardGoal,
  DashboardPeriod,
} from "@/server/dto/dashboard";
import { parseCalendarDateInput } from "@/shared/helpers/format";

function toNumber(value: Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

function sum(values: (number | null | undefined)[]): number {
  return values.reduce<number>((acc, value) => acc + (value ?? 0), 0);
}

function getPeriodInterval(period: DashboardPeriod, referenceDate: Date) {
  if (period === "day") {
    return {
      start: startOfDay(referenceDate),
      end: endOfDay(referenceDate),
    };
  }

  if (period === "week") {
    return {
      start: startOfWeek(referenceDate, { weekStartsOn: 1 }),
      end: endOfWeek(referenceDate, { weekStartsOn: 1 }),
    };
  }

  return {
    start: startOfMonth(referenceDate),
    end: endOfMonth(referenceDate),
  };
}

function isInPeriod(
  date: Date,
  period: DashboardPeriod,
  referenceDate: Date
): boolean {
  if (period === "day") return isSameDay(date, referenceDate);
  if (period === "week") return isSameWeek(date, referenceDate, { weekStartsOn: 1 });
  return isSameMonth(date, referenceDate);
}

function getGoalPeriod(period: DashboardPeriod): "DAILY" | "WEEKLY" | "MONTHLY" {
  if (period === "day") return "DAILY";
  if (period === "week") return "WEEKLY";
  return "MONTHLY";
}

export class DashboardService {
  async getDashboard(
    userId: string,
    period: DashboardPeriod = "day",
    dateString?: string
  ): Promise<DashboardDto> {
    const referenceDate = dateString
      ? new UTCDate(parseCalendarDateInput(dateString))
      : new UTCDate();

    const periodInterval = getPeriodInterval(period, referenceDate);

    const trendStart =
      period === "day" ? startOfDay(subDays(referenceDate, 6)) : periodInterval.start;
    const trendEnd = period === "day" ? endOfDay(referenceDate) : periodInterval.end;

    const start12Months = startOfMonth(subMonths(referenceDate, 11));
    const startMonth = startOfMonth(referenceDate);
    const endMonth = endOfMonth(referenceDate);

    const [shifts, expenses, fuelLogs, allShifts, allExpenses, monthExpenses, goal] =
      await Promise.all([
        prisma.workShift.findMany({
          where: {
            userId,
            deletedAt: null,
            date: { gte: trendStart, lte: trendEnd },
          },
          include: { incomes: true },
        }),
        prisma.expense.findMany({
          where: {
            userId,
            deletedAt: null,
            date: { gte: trendStart, lte: trendEnd },
          },
        }),
        prisma.fuelLog.findMany({
          where: {
            userId,
            deletedAt: null,
            date: { gte: trendStart, lte: trendEnd },
          },
        }),
        prisma.workShift.findMany({
          where: {
            userId,
            deletedAt: null,
            date: { gte: start12Months, lte: endOfDay(referenceDate) },
          },
          include: { incomes: true },
        }),
        prisma.expense.findMany({
          where: {
            userId,
            deletedAt: null,
            date: { gte: start12Months, lte: endOfDay(referenceDate) },
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
            period: getGoalPeriod(period),
            isActive: true,
            startDate: { lte: referenceDate },
            OR: [{ endDate: null }, { endDate: { gte: referenceDate } }],
          },
        }),
      ]);

    const periodShifts = shifts.filter((shift) =>
      isInPeriod(shift.date, period, referenceDate)
    );

    const periodIncome = sum(
      periodShifts.flatMap((shift) =>
        shift.incomes.map((income) => toNumber(income.amount))
      )
    );

    const periodTrips = sum(periodShifts.map((shift) => shift.totalTrips));
    const periodHours = sum(
      periodShifts.map((shift) => toNumber(shift.onlineHours))
    );

    const periodExpenses = sum(
      expenses
        .filter((expense) => isInPeriod(expense.date, period, referenceDate))
        .map((expense) => toNumber(expense.amount))
    );

    const periodFuel = sum(
      fuelLogs
        .filter((log) => isInPeriod(log.date, period, referenceDate))
        .map((log) => toNumber(log.totalAmount))
    );

    const profit = periodIncome - periodExpenses;
    const margin = periodIncome > 0 ? (profit / periodIncome) * 100 : 0;
    const profitPerHour = periodHours > 0 ? profit / periodHours : 0;
    const incomePerTrip = periodTrips > 0 ? periodIncome / periodTrips : 0;

    const incomeTrend = eachDayOfInterval({
      start: trendStart,
      end: trendEnd,
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
      end: referenceDate,
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
      const percentage = target > 0 ? Math.min(100, (periodIncome / target) * 100) : 0;

      dashboardGoal = {
        targetAmount: target,
        currentAmount: periodIncome,
        percentage,
        remaining: Math.max(0, target - periodIncome),
      };
    }

    return {
      period,
      referenceDate,
      stats: {
        income: periodIncome,
        expenses: periodExpenses,
        profit,
        hours: periodHours,
        trips: periodTrips,
        fuel: periodFuel,
        margin,
        profitPerHour,
        incomePerTrip,
      },
      goal: dashboardGoal,
      incomeTrend,
      monthlyProfit,
      expenseDistribution,
    };
  }
}

export const dashboardService = new DashboardService();
