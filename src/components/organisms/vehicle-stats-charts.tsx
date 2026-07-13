"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/components/atoms/chart-card";
import { formatCurrency, formatNumber } from "@/shared/helpers/format";
import type { VehicleStatistics } from "@/server/services/statistics-service";

type VehicleStatsChartsProps = {
  stats: VehicleStatistics;
};

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
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

function NumberTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-2 text-xs text-popover-foreground shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index}>{formatNumber(entry.value)}</p>
        ))}
      </div>
    );
  }
  return null;
}

export function VehicleStatsCharts({ stats }: VehicleStatsChartsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ChartCard title="Ingresos" description="Total anual">
        <div className="text-2xl font-bold">{formatCurrency(stats.income)}</div>
      </ChartCard>
      <ChartCard title="Gastos" description="Total anual">
        <div className="text-2xl font-bold">{formatCurrency(stats.expenses)}</div>
      </ChartCard>
      <ChartCard title="Ganancia" description="Ingresos - gastos">
        <div className="text-2xl font-bold">{formatCurrency(stats.profit)}</div>
      </ChartCard>
      <ChartCard title="Combustible" description="Total anual">
        <div className="text-2xl font-bold">{formatCurrency(stats.fuel)}</div>
      </ChartCard>
      <ChartCard title="Distancia" description="Kilómetros recorridos">
        <div className="text-2xl font-bold">{formatNumber(stats.distanceKm)} km</div>
      </ChartCard>
      <ChartCard title="Horas" description="Horas online">
        <div className="text-2xl font-bold">{formatNumber(stats.hours)} h</div>
      </ChartCard>
      <ChartCard title="Viajes" description="Total de viajes">
        <div className="text-2xl font-bold">{formatNumber(stats.trips)}</div>
      </ChartCard>
      <ChartCard title="Rendimiento" description="Promedio km/L">
        <div className="text-2xl font-bold">{stats.fuelEfficiency ? `${formatNumber(stats.fuelEfficiency)} km/L` : "—"}</div>
      </ChartCard>

      <div className="sm:col-span-2 lg:col-span-2">
        <ChartCard title="Evolución mensual" description="Ingresos vs gastos">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CurrencyTooltip />} />
              <Bar dataKey="income" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="sm:col-span-2 lg:col-span-2">
        <ChartCard title="Kilómetros mensuales" description="Distancia recorrida por mes">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} km`} />
              <Tooltip content={<NumberTooltip />} />
              <Line type="monotone" dataKey="distanceKm" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
