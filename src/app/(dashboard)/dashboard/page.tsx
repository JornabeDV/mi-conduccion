import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { dashboardService } from "@/server/services/dashboard-service";
import { DashboardStats } from "@/components/organisms/dashboard-stats";
import { DashboardCharts } from "@/components/organisms/dashboard-charts";
import { DashboardFilters } from "@/components/molecules/dashboard-filters";
import { formatDashboardPeriodLabel } from "@/shared/helpers/format";
import type { DashboardPeriod } from "@/server/dto/dashboard";

const VALID_PERIODS: DashboardPeriod[] = ["day", "week", "month"];

function parsePeriod(value: string | undefined): DashboardPeriod {
  if (value && VALID_PERIODS.includes(value as DashboardPeriod)) {
    return value as DashboardPeriod;
  }
  return "day";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const session = await getSession().catch(() => null);

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const period = parsePeriod(params.period);

  const data = await dashboardService.getDashboard(
    session.user.id,
    period,
    params.date
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen de tu actividad {formatDashboardPeriodLabel(data.period, data.referenceDate)}
          </p>
        </div>

        <DashboardFilters period={period} date={data.referenceDate} />
      </div>

      <DashboardStats stats={data.stats} goal={data.goal} period={data.period} />

      <DashboardCharts
        incomeTrend={data.incomeTrend}
        profitTrend={data.profitTrend}
        period={data.period}
      />
    </div>
  );
}
