import {
  Banknote,
  TrendingUp,
  Target,
  Clock,
  Car,
  Fuel,
  Percent,
} from "lucide-react";
import { KpiCard } from "@/components/atoms/kpi-card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatNumber, formatPercentage } from "@/shared/helpers/format";
import type {
  DashboardGoal,
  DashboardTodayStats,
} from "@/server/dto/dashboard";

type DashboardStatsProps = {
  today: DashboardTodayStats;
  goal: DashboardGoal;
};

export function DashboardStats({ today, goal }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Ingresos hoy"
        value={formatCurrency(today.income)}
        description="Total de ingresos"
        icon={<Banknote />}
      />

      <KpiCard
        title="Ganancia hoy"
        value={formatCurrency(today.profit)}
        description={`Gastos: ${formatCurrency(today.expenses)}`}
        icon={<TrendingUp />}
      />

      <KpiCard
        title="Objetivo diario"
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
        title="Horas trabajadas"
        value={formatNumber(today.hours)}
        description="Horas online hoy"
        icon={<Clock />}
      />

      <KpiCard
        title="Viajes realizados"
        value={formatNumber(today.trips)}
        description="Total de viajes"
        icon={<Car />}
      />

      <KpiCard
        title="Ganancia / hora"
        value={formatCurrency(today.profitPerHour)}
        description="Basado en horas online"
        icon={<TrendingUp />}
      />

      <KpiCard
        title="Ingreso / viaje"
        value={formatCurrency(today.incomePerTrip)}
        description="Promedio por viaje"
        icon={<Banknote />}
      />

      <KpiCard
        title="Combustible"
        value={formatCurrency(today.fuel)}
        description="Gasto en combustible hoy"
        icon={<Fuel />}
      />

      <KpiCard
        title="Margen estimado"
        value={formatPercentage(today.margin)}
        description="Rentabilidad sobre ingresos"
        icon={<Percent />}
      />
    </div>
  );
}
