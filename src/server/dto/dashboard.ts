export type DashboardTodayStats = {
  income: number;
  expenses: number;
  profit: number;
  hours: number;
  trips: number;
  fuel: number;
  margin: number;
  profitPerHour: number;
  incomePerTrip: number;
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

export type MonthlyProfitDataPoint = {
  month: string;
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
  today: DashboardTodayStats;
  goal: DashboardGoal;
  last7Days: DailyDataPoint[];
  last30Days: DailyDataPoint[];
  monthlyProfit: MonthlyProfitDataPoint[];
  expenseDistribution: ExpenseDistributionDataPoint[];
};
