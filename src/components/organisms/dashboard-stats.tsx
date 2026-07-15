import {
  Banknote,
  TrendingUp,
  Target,
  Clock,
  Car,
  Fuel,
  Percent,
  Route,
  Gauge,
} from "lucide-react";
import { KpiCard } from "@/components/atoms/kpi-card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatNumber, formatPercentage } from "@/shared/helpers/format";
import { formatDuration } from "@/shared/helpers/time";
import type {
  DashboardGoal,
  DashboardPeriod,
  DashboardPeriodStats,
} from "@/server/dto/dashboard";

type DashboardStatsProps = {
  stats: DashboardPeriodStats;
  goal: DashboardGoal;
  period: DashboardPeriod;
};

const PERIOD_LABELS = {
  day: {
    income: "Ingresos hoy",
    profit: "Ganancia hoy",
    goal: "Objetivo diario",
    hours: "Tiempo trabajado",
    hoursDescription: "Tiempo online hoy",
    trips: "Viajes realizados",
    tripsDescription: "Total de viajes",
    fuel: "Combustible",
    fuelDescription: "Gasto en combustible hoy",
    margin: "Margen estimado",
    distance: "Kilómetros recorridos",
    distanceDescription: "Distancia total hoy",
    profitPerKm: "Ganancia / km",
    profitPerKmDescription: "Ganancia por kilómetro hoy",
  },
  week: {
    income: "Ingresos de la semana",
    profit: "Ganancia de la semana",
    goal: "Objetivo semanal",
    hours: "Tiempo trabajado",
    hoursDescription: "Tiempo online esta semana",
    trips: "Viajes realizados",
    tripsDescription: "Total de viajes",
    fuel: "Combustible",
    fuelDescription: "Gasto en combustible esta semana",
    margin: "Margen estimado",
    distance: "Kilómetros recorridos",
    distanceDescription: "Distancia total esta semana",
    profitPerKm: "Ganancia / km",
    profitPerKmDescription: "Ganancia por kilómetro esta semana",
  },
  month: {
    income: "Ingresos del mes",
    profit: "Ganancia del mes",
    goal: "Objetivo mensual",
    hours: "Tiempo trabajado",
    hoursDescription: "Tiempo online este mes",
    trips: "Viajes realizados",
    tripsDescription: "Total de viajes",
    fuel: "Combustible",
    fuelDescription: "Gasto en combustible este mes",
    margin: "Margen estimado",
    distance: "Kilómetros recorridos",
    distanceDescription: "Distancia total este mes",
    profitPerKm: "Ganancia / km",
    profitPerKmDescription: "Ganancia por kilómetro este mes",
  },
};

export function DashboardStats({ stats, goal, period }: DashboardStatsProps) {
  const labels = PERIOD_LABELS[period];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title={labels.income}
        value={formatCurrency(stats.income)}
        description="Total de ingresos"
        icon={<Banknote />}
      />

      <KpiCard
        title={labels.profit}
        value={formatCurrency(stats.profit)}
        description={`Gastos: ${formatCurrency(stats.expenses)}`}
        icon={<TrendingUp />}
      />

      <KpiCard
        title={labels.goal}
        value={
          goal ? (
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {formatPercentage(goal.percentage)}
              </div>
              <Progress value={goal.percentage} className="h-2" />
            </div>
          ) : (
            "—"
          )
        }
        description={
          goal
            ? `${formatCurrency(goal.currentAmount)} de ${formatCurrency(
                goal.targetAmount
              )}`
            : "Sin objetivo activo"
        }
        icon={<Target />}
      />

      <KpiCard
        title={labels.hours}
        value={formatDuration(stats.hours)}
        description={labels.hoursDescription}
        icon={<Clock />}
      />

      <KpiCard
        title={labels.trips}
        value={formatNumber(stats.trips)}
        description={labels.tripsDescription}
        icon={<Car />}
      />

      <KpiCard
        title="Ganancia / hora"
        value={formatCurrency(stats.profitPerHour)}
        description="Basado en horas online"
        icon={<TrendingUp />}
      />

      <KpiCard
        title="Ingreso / viaje"
        value={formatCurrency(stats.incomePerTrip)}
        description="Promedio por viaje"
        icon={<Banknote />}
      />

      <KpiCard
        title={labels.fuel}
        value={formatCurrency(stats.fuel)}
        description={labels.fuelDescription}
        icon={<Fuel />}
      />

      <KpiCard
        title={labels.margin}
        value={formatPercentage(stats.margin)}
        description="Rentabilidad sobre ingresos"
        icon={<Percent />}
      />

      <KpiCard
        title={labels.distance}
        value={formatNumber(stats.distanceKm)}
        description={labels.distanceDescription}
        icon={<Route />}
      />

      <KpiCard
        title={labels.profitPerKm}
        value={formatCurrency(stats.profitPerKm)}
        description={labels.profitPerKmDescription}
        icon={<Gauge />}
      />
    </div>
  );
}
