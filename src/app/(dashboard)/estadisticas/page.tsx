import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { statisticsService } from "@/server/services/statistics-service";
import { VehicleStatsCharts } from "@/components/organisms/vehicle-stats-charts";
import { StatisticsRangeFilter } from "@/components/molecules/statistics-range-filter";
import { StatisticsGroupingFilter } from "@/components/molecules/statistics-grouping-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  STATISTICS_GROUPING_LABELS,
  STATISTICS_RANGE_LABELS,
  formatRangeLabel,
  parseStatisticsGrouping,
  parseStatisticsRange,
} from "@/server/dto/statistics";

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; grouping?: string }>;
}) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const params = await searchParams;
  const range = parseStatisticsRange(params.range);
  const grouping = parseStatisticsGrouping(params.grouping);

  const data = await statisticsService.getVehicleStatistics(session.user.id, range, grouping);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Estadísticas</h1>
          <p className="text-sm text-muted-foreground">
            {STATISTICS_RANGE_LABELS[range]} · {STATISTICS_GROUPING_LABELS[grouping].toLowerCase()}
            {" · "}{formatRangeLabel(new Date(data.startDate), new Date(data.endDate))}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <StatisticsRangeFilter />
          <StatisticsGroupingFilter />
        </div>
      </div>

      {data.vehicles.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
          No hay vehículos registrados.
        </div>
      ) : (
        <Tabs defaultValue={data.vehicles[0]?.vehicleId}>
          {data.vehicles.length > 1 && (
            <TabsList className="w-full">
              {data.vehicles.map((stats) => (
                <TabsTrigger key={stats.vehicleId} value={stats.vehicleId}>
                  {stats.vehicleName}
                </TabsTrigger>
              ))}
            </TabsList>
          )}
          {data.vehicles.map((stats) => (
            <TabsContent key={stats.vehicleId} value={stats.vehicleId}>
              <VehicleStatsCharts stats={stats} grouping={grouping} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
