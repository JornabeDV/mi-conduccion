import type { Decimal } from "@prisma/client/runtime/library";
import {
  eachDayOfInterval,
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

function toUTCDate(date: Date): UTCDate {
  return new UTCDate(date);
}

function getPeriodInterval(period: DashboardPeriod, referenceDate: UTCDate) {
  if (period === "day") {
    return {
      start: toUTCDate(startOfDay(referenceDate)),
      end: toUTCDate(endOfDay(referenceDate)),
    };
  }

  if (period === "week") {
    return {
      start: toUTCDate(startOfWeek(referenceDate, { weekStartsOn: 1 })),
      end: toUTCDate(endOfWeek(referenceDate, { weekStartsOn: 1 })),
    };
  }

  return {
    start: toUTCDate(startOfMonth(referenceDate)),
    end: toUTCDate(endOfMonth(referenceDate)),
  };
}

function getTrendInterval(period: DashboardPeriod, referenceDate: UTCDate) {
  if (period === "day") {
    return {
      start: toUTCDate(startOfDay(subDays(referenceDate, 6))),
      end: toUTCDate(endOfDay(referenceDate)),
    };
  }

  return getPeriodInterval(period, referenceDate);
}

function isInPeriod(
  date: Date,
  period: DashboardPeriod,
  referenceDate: UTCDate
): boolean {
  const utcDate = toUTCDate(date);
  if (period === "day") return isSameDay(utcDate, referenceDate);
  if (period === "week") return isSameWeek(utcDate, referenceDate, { weekStartsOn: 1 });
  return isSameMonth(utcDate, referenceDate);
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
    const trendInterval = getTrendInterval(period, referenceDate);

    const startMonth = toUTCDate(startOfMonth(referenceDate));
    const endMonth = toUTCDate(endOfMonth(referenceDate));

    const [shifts, expenses, fuelLogs, monthExpenses, goal] = await Promise.all([
      prisma.workShift.findMany({
        where: {
          userId,
          deletedAt: null,
          date: { gte: trendInterval.start, lte: trendInterval.end },
        },
        include: { incomes: true },
      }),
      prisma.expense.findMany({
        where: {
          userId,
          deletedAt: null,
          date: { gte: trendInterval.start, lte: trendInterval.end },
        },
      }),
      prisma.fuelLog.findMany({
        where: {
          userId,
          deletedAt: null,
          date: { gte: trendInterval.start, lte: trendInterval.end },
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
    const periodDistanceKm = sum(
      periodShifts.map((shift) => toNumber(shift.distanceKm))
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
    const profitPerKm = periodDistanceKm > 0 ? profit / periodDistanceKm : 0;
    const kmPerHour = periodHours > 0 ? periodDistanceKm / periodHours : 0;

    const trendDates = eachDayOfInterval({
      start: trendInterval.start,
      end: trendInterval.end,
    }).map(toUTCDate);

    const incomeTrend = trendDates.map((date) => ({
      date: date.toISOString(),
      label: format(date, "dd/MM"),
      income: sum(
        shifts
          .filter((shift) => isSameDay(toUTCDate(shift.date), date))
          .flatMap((shift) =>
            shift.incomes.map((income) => toNumber(income.amount))
          )
      ),
    }));

    const profitTrend = trendDates.map((date) => {
      const income = sum(
        shifts
          .filter((shift) => isSameDay(toUTCDate(shift.date), date))
          .flatMap((shift) =>
            shift.incomes.map((income) => toNumber(income.amount))
          )
      );
      const expensesTotal = sum(
        expenses
          .filter((expense) => isSameDay(toUTCDate(expense.date), date))
          .map((expense) => toNumber(expense.amount))
      );
      return {
        label: format(date, "dd/MM"),
        income,
        expenses: expensesTotal,
        profit: income - expensesTotal,
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
        distanceKm: periodDistanceKm,
        profitPerKm,
        kmPerHour,
      },
      goal: dashboardGoal,
      incomeTrend,
      profitTrend,
      expenseDistribution,
    };
  }
}

export const dashboardService = new DashboardService();
