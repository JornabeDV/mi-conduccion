"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/atoms/chart-card";
import { formatCurrency } from "@/shared/helpers/format";
import type {
  DailyDataPoint,
  ProfitTrendDataPoint,
  DashboardPeriod,
} from "@/server/dto/dashboard";

type DashboardChartsProps = {
  incomeTrend: DailyDataPoint[];
  profitTrend: ProfitTrendDataPoint[];
  period: DashboardPeriod;
};

const COLORS = {
  income: "#10b981", // emerald-500
  expenses: "#f43f5e", // rose-500
  profit: "#3b82f6", // blue-500
};

const TREND_TITLES: Record<
  DashboardPeriod,
  { income: { title: string; description: string }; profit: { title: string; description: string } }
> = {
  day: {
    income: {
      title: "Ingresos últimos 7 días",
      description: "Contexto de la última semana.",
    },
    profit: {
      title: "Ganancia últimos 7 días",
      description: "Ingresos vs gastos por día.",
    },
  },
  week: {
    income: {
      title: "Ingresos de la semana",
      description: "Suma diaria de ingresos.",
    },
    profit: {
      title: "Ganancia de la semana",
      description: "Ingresos vs gastos por día.",
    },
  },
  month: {
    income: {
      title: "Ingresos del mes",
      description: "Tendencia diaria de ingresos.",
    },
    profit: {
      title: "Ganancia del mes",
      description: "Ingresos vs gastos por día.",
    },
  },
};

function CurrencyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-2 text-xs text-popover-foreground shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function DashboardCharts({
  incomeTrend,
  profitTrend,
  period,
}: DashboardChartsProps) {
  const titles = TREND_TITLES[period];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title={titles.income.title} description={titles.income.description}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={incomeTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip content={<CurrencyTooltip />} />
            <Bar dataKey="income" name="Ingresos" fill={COLORS.income} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={titles.profit.title} description={titles.profit.description}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={profitTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip content={<CurrencyTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 8 }} />
            <Bar dataKey="income" name="Ingresos" fill={COLORS.income} radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" name="Gastos" fill={COLORS.expenses} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
