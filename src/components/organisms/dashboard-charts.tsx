"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/atoms/chart-card";
import { formatCurrency } from "@/shared/helpers/format";
import { EXPENSE_CATEGORY_LABELS } from "@/shared/constants/expense-categories";
import type {
  DailyDataPoint,
  ExpenseDistributionDataPoint,
  MonthlyProfitDataPoint,
  DashboardPeriod,
} from "@/server/dto/dashboard";

type DashboardChartsProps = {
  incomeTrend: DailyDataPoint[];
  monthlyProfit: MonthlyProfitDataPoint[];
  expenseDistribution: ExpenseDistributionDataPoint[];
  period: DashboardPeriod;
};

const COLORS = [
  "hsl(var(--foreground))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--primary))",
  "hsl(var(--secondary-foreground))",
  "hsl(var(--accent-foreground))",
  "hsl(var(--ring))",
  "hsl(var(--border))",
  "hsl(var(--input))",
  "hsl(var(--destructive))",
];

const TREND_TITLES: Record<DashboardPeriod, { title: string; description: string }> = {
  day: {
    title: "Ingresos últimos 7 días",
    description: "Contexto de la última semana.",
  },
  week: {
    title: "Ingresos de la semana",
    description: "Suma diaria de ingresos.",
  },
  month: {
    title: "Ingresos del mes",
    description: "Tendencia diaria de ingresos.",
  },
};

function CurrencyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-2 text-xs text-popover-foreground shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index}>{formatCurrency(entry.value)}</p>
        ))}
      </div>
    );
  }
  return null;
}

export function DashboardCharts({
  incomeTrend,
  monthlyProfit,
  expenseDistribution,
  period,
}: DashboardChartsProps) {
  const trend = TREND_TITLES[period];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title={trend.title} description={trend.description}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={incomeTrend}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CurrencyTooltip />} />
            <Bar dataKey="income" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Ganancia mensual" description="Ingresos vs gastos por mes.">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyProfit}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CurrencyTooltip />} />
            <Bar dataKey="income" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Distribución de gastos" description="Gastos del mes actual por categoría.">
        {expenseDistribution.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            Sin gastos registrados este mes.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ExpenseDistributionDataPoint;
                    return (
                      <div className="rounded-lg border bg-popover p-2 text-xs text-popover-foreground shadow-md">
                        <p className="font-medium">
                          {EXPENSE_CATEGORY_LABELS[data.category as keyof typeof EXPENSE_CATEGORY_LABELS] ??
                            data.category}
                        </p>
                        <p>{formatCurrency(data.amount)}</p>
                        <p>{data.percentage.toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={expenseDistribution}
                dataKey="amount"
                nameKey="category"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {expenseDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
