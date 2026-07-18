export type DashboardPeriod = "day" | "week" | "month";

export type DashboardPeriodStats = {
  income: number;
  expenses: number;
  profit: number;
  hours: number;
  trips: number;
  fuel: number;
  margin: number;
  profitPerHour: number;
  incomePerTrip: number;
  distanceKm: number;
  profitPerKm: number;
  kmPerHour: number;
};

export type DashboardGoal = {
  targetAmount: number;
  currentAmount: number;
  percentage: number;
  remaining: number;
} | null;

export type DailyDataPoint = {
  date: string;
  label: string;
  income: number;
};

export type ProfitTrendDataPoint = {
  label: string;
  income: number;
  expenses: number;
  profit: number;
};

export type ExpenseDistributionDataPoint = {
  category: string;
  amount: number;
  percentage: number;
};

export type DashboardDto = {
  period: DashboardPeriod;
  referenceDate: Date;
  stats: DashboardPeriodStats;
  goal: DashboardGoal;
  incomeTrend: DailyDataPoint[];
  profitTrend: ProfitTrendDataPoint[];
  expenseDistribution: ExpenseDistributionDataPoint[];
};
