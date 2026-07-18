"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/atoms/chart-card";
import { formatCurrency, formatNumber } from "@/shared/helpers/format";
import {
  STATISTICS_GROUPING_LABELS,
  type StatisticsGrouping,
  type StatisticsVehiclePoint,
  type ExpenseDistributionPoint,
} from "@/server/dto/statistics";

type VehicleStatsChartsProps = {
  stats: StatisticsVehiclePoint;
  grouping: StatisticsGrouping;
};

const COLORS = {
  income: "#10b981", // emerald-500
  expenses: "#f43f5e", // rose-500
  profit: "#3b82f6", // blue-500
  distance: "#8b5cf6", // violet-500
  fuel: "#f97316", // orange-500
};

const PIE_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f43f5e",
  "#f97316",
  "#8b5cf6",
  "#06b6d4",
  "#eab308",
  "#64748b",
];

const CHART_TITLES: Record<StatisticsGrouping, { main: string; distance: string }> = {
  day: { main: "Evolución diaria", distance: "Kilómetros diarios" },
  week: { main: "Evolución semanal", distance: "Kilómetros semanales" },
  month: { main: "Evolución mensual", distance: "Kilómetros mensuales" },
};

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-2 text-xs text-popover-foreground shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index}>{entry.name}: {formatCurrency(entry.value)}</p>
        ))}
      </div>
    );
  }
  return null;
}

function NumberTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-2 text-xs text-popover-foreground shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index}>{entry.name}: {formatNumber(entry.value)}</p>
        ))}
      </div>
    );
  }
  return null;
}

function PercentTooltip({ active, payload }: { active?: boolean; payload?: { payload: ExpenseDistributionPoint }[] }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-popover p-2 text-xs text-popover-foreground shadow-md">
        <p className="font-medium">{data.category}</p>
        <p>{formatCurrency(data.amount)}</p>
        <p>{data.percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
}

export function VehicleStatsCharts({ stats, grouping }: VehicleStatsChartsProps) {
  const titles = CHART_TITLES[grouping];
  const timeline = stats.timeline;

  const targetTicks = 6;
  const xAxisInterval = Math.max(0, Math.ceil(timeline.length / targetTicks) - 1);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <ChartCard title={titles.main} description={`Ingresos, gastos y ganancia (${STATISTICS_GROUPING_LABELS[grouping].toLowerCase()})`}>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.income} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.income} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.expenses} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.expenses} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.profit} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.profit} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
                interval={xAxisInterval}
              />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CurrencyTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 8 }} />
              <Area type="monotone" dataKey="income" name="Ingresos" stroke={COLORS.income} fill="url(#incomeGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Gastos" stroke={COLORS.expenses} fill="url(#expensesGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="profit" name="Ganancia" stroke={COLORS.profit} fill="url(#profitGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Distribución de gastos" description="Por categoría">
        {stats.expenseDistribution.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Sin gastos registrados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Tooltip content={<PercentTooltip />} />
              <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Pie
                data={stats.expenseDistribution}
                dataKey="amount"
                nameKey="category"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {stats.expenseDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title={titles.distance} description="Distancia recorrida">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              stroke="hsl(var(--muted-foreground))"
              interval={xAxisInterval}
            />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} km`} stroke="hsl(var(--muted-foreground))" />
            <Tooltip content={<NumberTooltip />} />
            <Line type="monotone" dataKey="distanceKm" name="Kilómetros" stroke={COLORS.distance} strokeWidth={3} dot={{ r: 4, fill: COLORS.distance }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Rendimiento de combustible" description="km/L promedio">
        <div className="flex h-[280px] flex-col items-center justify-center gap-2">
          <span className="text-5xl font-bold" style={{ color: COLORS.fuel }}>
            {stats.fuelEfficiency ? formatNumber(stats.fuelEfficiency) : "—"}
          </span>
          <span className="text-sm text-muted-foreground">km/L</span>
        </div>
      </ChartCard>
    </div>
  );
}
