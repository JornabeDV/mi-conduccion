import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { dashboardService } from "@/server/services/dashboard-service";
import { DashboardStats } from "@/components/organisms/dashboard-stats";
import { DashboardCharts } from "@/components/organisms/dashboard-charts";
import { formatDate } from "@/shared/helpers/format";

export default async function DashboardPage() {
  const session = await getSession().catch(() => null);

  if (!session) {
    redirect("/login");
  }

  const data = await dashboardService.getDashboard(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen de tu actividad al {formatDate(new Date())}
          </p>
        </div>
      </div>

      <DashboardStats today={data.today} goal={data.goal} />

      <DashboardCharts
        last7Days={data.last7Days}
        last30Days={data.last30Days}
        monthlyProfit={data.monthlyProfit}
        expenseDistribution={data.expenseDistribution}
      />
    </div>
  );
}
