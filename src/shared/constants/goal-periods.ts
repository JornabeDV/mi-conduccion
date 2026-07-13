export const GOAL_PERIODS = ["DAILY", "WEEKLY", "MONTHLY"] as const;

export type GoalPeriod = (typeof GOAL_PERIODS)[number];

export const GOAL_PERIOD_LABELS: Record<GoalPeriod, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
};
