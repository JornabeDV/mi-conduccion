import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  format,
  getWeek,
  startOfDay,
  startOfWeek,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { es } from "date-fns/locale";
import { UTCDate } from "@date-fns/utc";

export type StatisticsRange = "1m" | "3m" | "6m" | "1y";
export type StatisticsGrouping = "day" | "week" | "month";

export type StatisticsTimelinePoint = {
  period: string;
  label: string;
  income: number;
  expenses: number;
  profit: number;
  distanceKm: number;
};

export type ExpenseDistributionPoint = {
  category: string;
  amount: number;
  percentage: number;
};

export type StatisticsVehiclePoint = {
  vehicleId: string;
  vehicleName: string;
  timeline: StatisticsTimelinePoint[];
  expenseDistribution: ExpenseDistributionPoint[];
  fuelEfficiency: number | null;
};

export type StatisticsDto = {
  range: StatisticsRange;
  grouping: StatisticsGrouping;
  startDate: string;
  endDate: string;
  vehicles: StatisticsVehiclePoint[];
};

export const STATISTICS_RANGE_LABELS: Record<StatisticsRange, string> = {
  "1m": "1 mes",
  "3m": "3 meses",
  "6m": "6 meses",
  "1y": "1 año",
};

export const STATISTICS_RANGES: { value: StatisticsRange; label: string }[] = [
  { value: "1m", label: "1 mes" },
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "1y", label: "1 año" },
];

export const STATISTICS_GROUPING_LABELS: Record<StatisticsGrouping, string> = {
  day: "Diario",
  week: "Semanal",
  month: "Mensual",
};

export const STATISTICS_GROUPINGS: { value: StatisticsGrouping; label: string }[] = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

export function parseStatisticsRange(value: string | undefined): StatisticsRange {
  const ranges: StatisticsRange[] = ["1m", "3m", "6m", "1y"];
  if (value && ranges.includes(value as StatisticsRange)) {
    return value as StatisticsRange;
  }
  return "3m";
}

export function parseStatisticsGrouping(value: string | undefined): StatisticsGrouping {
  const groupings: StatisticsGrouping[] = ["day", "week", "month"];
  if (value && groupings.includes(value as StatisticsGrouping)) {
    return value as StatisticsGrouping;
  }
  return "week";
}

function toUTCDate(date: Date): UTCDate {
  return new UTCDate(date);
}

export function getRangeInterval(range: StatisticsRange) {
  const today = toUTCDate(endOfDay(new UTCDate()));
  const end = today;
  let start: UTCDate;

  if (range === "1m") {
    start = toUTCDate(startOfDay(subMonths(today, 1)));
  } else if (range === "3m") {
    start = toUTCDate(startOfDay(subMonths(today, 3)));
  } else if (range === "6m") {
    start = toUTCDate(startOfDay(subMonths(today, 6)));
  } else {
    start = toUTCDate(startOfDay(subYears(today, 1)));
  }

  return { start, end };
}

type TimelineShift = { date: Date; distanceKm: number; income: number };
type TimelineExpense = { date: Date; amount: number };

export function buildTimeline(
  grouping: StatisticsGrouping,
  start: Date,
  end: Date,
  shifts: TimelineShift[],
  expenses: TimelineExpense[],
): StatisticsTimelinePoint[] {
  const startUTC = toUTCDate(start);
  const endUTC = toUTCDate(end);

  if (grouping === "day") {
    const days = eachDayOfInterval({ start: startUTC, end: endUTC }).map(toUTCDate);
    return days.map((day) => {
      const dayStart = toUTCDate(startOfDay(day));
      const dayEnd = toUTCDate(endOfDay(day));
      const dayShifts = shifts.filter((s) => {
        const d = toUTCDate(s.date);
        return d >= dayStart && d <= dayEnd;
      });
      const dayExpenses = expenses.filter((e) => {
        const d = toUTCDate(e.date);
        return d >= dayStart && d <= dayEnd;
      });
      const income = dayShifts.reduce((sum, s) => sum + s.income, 0);
      const expensesTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      const distanceKm = dayShifts.reduce((sum, s) => sum + s.distanceKm, 0);
      return {
        period: format(day, "yyyy-MM-dd"),
        label: format(day, "dd/MM", { locale: es }),
        income,
        expenses: expensesTotal,
        profit: income - expensesTotal,
        distanceKm,
      };
    });
  }

  if (grouping === "week") {
    const weeks: UTCDate[] = [];
    let current = toUTCDate(startOfWeek(startUTC, { weekStartsOn: 1 }));
    const last = toUTCDate(startOfWeek(endUTC, { weekStartsOn: 1 }));
    while (current <= last) {
      weeks.push(current);
      current = toUTCDate(addWeeks(current, 1));
    }

    return weeks.map((weekStart) => {
      const weekEnd = toUTCDate(endOfDay(subDays(addWeeks(weekStart, 1), 1)));
      const weekShifts = shifts.filter((s) => {
        const d = toUTCDate(s.date);
        return d >= weekStart && d <= weekEnd;
      });
      const weekExpenses = expenses.filter((e) => {
        const d = toUTCDate(e.date);
        return d >= weekStart && d <= weekEnd;
      });
      const income = weekShifts.reduce((sum, s) => sum + s.income, 0);
      const expensesTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
      const distanceKm = weekShifts.reduce((sum, s) => sum + s.distanceKm, 0);
      return {
        period: format(weekStart, "yyyy-MM-dd"),
        label: `Sem ${getWeek(weekStart, { weekStartsOn: 1 })}`,
        income,
        expenses: expensesTotal,
        profit: income - expensesTotal,
        distanceKm,
      };
    });
  }

  // month
  const months = eachMonthOfInterval({ start: startUTC, end: endUTC }).map(toUTCDate);
  return months.map((month) => {
    const monthStart = toUTCDate(startOfDay(month));
    const monthEnd = toUTCDate(endOfDay(endOfMonth(month)));
    const monthShifts = shifts.filter((s) => {
      const d = toUTCDate(s.date);
      return d >= monthStart && d <= monthEnd;
    });
    const monthExpenses = expenses.filter((e) => {
      const d = toUTCDate(e.date);
      return d >= monthStart && d <= monthEnd;
    });
    const income = monthShifts.reduce((sum, s) => sum + s.income, 0);
    const expensesTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const distanceKm = monthShifts.reduce((sum, s) => sum + s.distanceKm, 0);
    return {
      period: format(month, "yyyy-MM-dd"),
      label: format(month, "MMM yyyy", { locale: es }),
      income,
      expenses: expensesTotal,
      profit: income - expensesTotal,
      distanceKm,
    };
  });
}

export function formatRangeLabel(startDate: string | Date, endDate: string | Date): string {
  const start = toUTCDate(new Date(startDate));
  const end = toUTCDate(new Date(endDate));
  return `${format(start, "dd/MM/yyyy", { locale: es })} - ${format(end, "dd/MM/yyyy", { locale: es })}`;
}

function isSameDayUTC(a: Date, b: Date): boolean {
  const ua = toUTCDate(a);
  const ub = toUTCDate(b);
  return ua.getFullYear() === ub.getFullYear() && ua.getMonth() === ub.getMonth() && ua.getDate() === ub.getDate();
}

function isSameMonthUTC(a: Date, b: Date): boolean {
  const ua = toUTCDate(a);
  const ub = toUTCDate(b);
  return ua.getFullYear() === ub.getFullYear() && ua.getMonth() === ub.getMonth();
}

// Preserve unused helpers if needed later; remove if lint complains.
export { isSameDayUTC, isSameMonthUTC };
