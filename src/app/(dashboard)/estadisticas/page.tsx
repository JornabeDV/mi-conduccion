import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { statisticsService } from "@/server/services/statistics-service";
import { VehicleStatsCharts } from "@/components/organisms/vehicle-stats-charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const params = await searchParams;
  const year = params.year ? Number(params.year) : new Date().getFullYear();

  const allStats = await statisticsService.getVehicleStatistics(session.user.id, year);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Estadísticas</h1>
        <p className="text-sm text-muted-foreground">Análisis por vehículo · {year}</p>
      </div>

      {allStats.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
          No hay vehículos registrados.
        </div>
      ) : (
        <Tabs defaultValue={allStats[0]?.vehicleId}>
          {allStats.length > 1 && (
            <TabsList className="w-full">
              {allStats.map((stats) => (
                <TabsTrigger key={stats.vehicleId} value={stats.vehicleId}>
                  {stats.vehicleName}
                </TabsTrigger>
              ))}
            </TabsList>
          )}
          {allStats.map((stats) => (
            <TabsContent key={stats.vehicleId} value={stats.vehicleId}>
              <VehicleStatsCharts stats={stats} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
