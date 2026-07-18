export type GoalSimulatorExpenses = {
  fuel: number;
  service: number;
  insurance: number;
  registration: number;
  other: number;
};

export type GoalSimulatorInput = {
  netGoal: number;
  expenses: GoalSimulatorExpenses;
  hourlyIncome: number;
  incomePerKm: number;
  daysPerWeek: number;
};

export type GoalSimulatorScenario = {
  daysPerWeek: number;
  dailyBilling: number;
  dailyHours: number;
  dailyKm: number;
  kmPerHour: number;
  weeklyBilling: number;
  weeklyHours: number;
  weeklyKm: number;
};

export type GoalSimulatorResult = {
  totalExpenses: number;
  billingTarget: number;
  weeklyBilling: number;
  dailyBilling: number;
  monthlyHours: number | null;
  weeklyHours: number | null;
  dailyHours: number | null;
  monthlyKm: number | null;
  weeklyKm: number | null;
  dailyKm: number | null;
  kmPerHour: number | null;
  scenarios: GoalSimulatorScenario[];
};

function roundKm(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundHours(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateGoalSimulator(input: GoalSimulatorInput): GoalSimulatorResult {
  const totalExpenses = roundMoney(
    input.expenses.fuel +
      input.expenses.service +
      input.expenses.insurance +
      input.expenses.registration +
      input.expenses.other
  );

  const billingTarget = roundMoney(input.netGoal + totalExpenses);
  const weeklyBilling = roundMoney(billingTarget / 4);
  const dailyBilling = roundMoney(weeklyBilling / input.daysPerWeek);

  const monthlyHours = input.hourlyIncome > 0 ? roundHours(billingTarget / input.hourlyIncome) : null;
  const weeklyHours = monthlyHours !== null ? roundHours(monthlyHours / 4) : null;
  const dailyHours =
    weeklyHours !== null && input.daysPerWeek > 0
      ? roundHours(weeklyHours / input.daysPerWeek)
      : null;

  const monthlyKm = input.incomePerKm > 0 ? roundKm(billingTarget / input.incomePerKm) : null;
  const weeklyKm = monthlyKm !== null ? roundKm(monthlyKm / 4) : null;
  const dailyKm =
    weeklyKm !== null && input.daysPerWeek > 0
      ? roundKm(weeklyKm / input.daysPerWeek)
      : null;
  const kmPerHour =
    dailyKm !== null && dailyHours !== null && dailyHours > 0
      ? roundKm(dailyKm / dailyHours)
      : null;

  const scenarios = [3, 4, 5, 6, 7].map((days) => {
    const scenarioWeeklyBilling = roundMoney(billingTarget / 4);
    const scenarioDailyBilling = roundMoney(scenarioWeeklyBilling / days);
    const scenarioWeeklyHours =
      monthlyHours !== null ? roundHours(monthlyHours / 4) : null;
    const scenarioDailyHours =
      scenarioWeeklyHours !== null ? roundHours(scenarioWeeklyHours / days) : null;
    const scenarioWeeklyKm = monthlyKm !== null ? roundKm(monthlyKm / 4) : null;
    const scenarioDailyKm =
      scenarioWeeklyKm !== null ? roundKm(scenarioWeeklyKm / days) : null;
    const scenarioKmPerHour =
      scenarioDailyKm !== null && scenarioDailyHours !== null && scenarioDailyHours > 0
        ? roundKm(scenarioDailyKm / scenarioDailyHours)
        : null;

    return {
      daysPerWeek: days,
      dailyBilling: scenarioDailyBilling,
      dailyHours: scenarioDailyHours ?? 0,
      dailyKm: scenarioDailyKm ?? 0,
      kmPerHour: scenarioKmPerHour ?? 0,
      weeklyBilling: scenarioWeeklyBilling,
      weeklyHours: scenarioWeeklyHours ?? 0,
      weeklyKm: scenarioWeeklyKm ?? 0,
    };
  });

  return {
    totalExpenses,
    billingTarget,
    weeklyBilling,
    dailyBilling,
    monthlyHours,
    weeklyHours,
    dailyHours,
    monthlyKm,
    weeklyKm,
    dailyKm,
    kmPerHour,
    scenarios,
  };
}

export const DEFAULT_GOAL_SIMULATOR_INPUT: GoalSimulatorInput = {
  netGoal: 0,
  expenses: {
    fuel: 0,
    service: 0,
    insurance: 0,
    registration: 0,
    other: 0,
  },
  hourlyIncome: 0,
  incomePerKm: 0,
  daysPerWeek: 5,
};
