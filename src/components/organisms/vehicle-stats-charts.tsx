"use client";

import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { ChartCard } from "@/components/atoms/chart-card";
import { useNivoTheme } from "@/hooks/use-nivo-theme";
import { formatCurrency, formatNumber } from "@/shared/helpers/format";
import {
  STATISTICS_GROUPING_LABELS,
  type StatisticsGrouping,
  type StatisticsVehiclePoint,
} from "@/server/dto/statistics";

type VehicleStatsChartsProps = {
  stats: StatisticsVehiclePoint;
  grouping: StatisticsGrouping;
};

const COLORS = {
  income: "var(--chart-income)",
  expenses: "var(--chart-expenses)",
  profit: "var(--chart-profit)",
  distance: "var(--chart-distance)",
  fuel: "var(--chart-fuel)",
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

export function VehicleStatsCharts({ stats, grouping }: VehicleStatsChartsProps) {
  const titles = CHART_TITLES[grouping];
  const timeline = stats.timeline;
  const chartTheme = useNivoTheme();

  const evolutionData = [
    {
      id: "Ingresos",
      color: COLORS.income,
      data: timeline.map((d) => ({ x: d.label, y: d.income })),
    },
    {
      id: "Gastos",
      color: COLORS.expenses,
      data: timeline.map((d) => ({ x: d.label, y: d.expenses })),
    },
    {
      id: "Ganancia",
      color: COLORS.profit,
      data: timeline.map((d) => ({ x: d.label, y: d.profit })),
    },
  ];

  const distanceData = [
    {
      id: "Kilómetros",
      color: COLORS.distance,
      data: timeline.map((d) => ({ x: d.label, y: d.distanceKm })),
    },
  ];

  const pieData = stats.expenseDistribution.map((entry, index) => ({
    id: entry.category,
    label: entry.category,
    value: entry.amount,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <ChartCard title={titles.main} description={`Ingresos, gastos y ganancia (${STATISTICS_GROUPING_LABELS[grouping].toLowerCase()})`}>
          <div className="h-[320px]">
            <ResponsiveLine
              data={evolutionData}
              colors={{ datum: "color" }}
              theme={chartTheme}
              margin={{ top: 20, right: 20, bottom: 50, left: 70 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
              curve="monotoneX"
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
                tickRotation: 0,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 10,
                format: (value) => `$${value}`,
              }}
              enableGridX={false}
              pointSize={0}
              pointBorderWidth={0}
              pointBorderColor={{ from: "seriesColor" }}
              useMesh
              enableSlices={false}
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  justify: false,
                  translateY: 40,
                  itemsSpacing: 16,
                  itemWidth: 80,
                  itemHeight: 16,
                  itemDirection: "left-to-right",
                  symbolSize: 12,
                  symbolShape: "circle",
                },
              ]}
              tooltip={({ point }) => (
                <div style={{ color: chartTheme.colors.popoverForeground }}>
                  <strong>{point.data.x as string}</strong>
                  <div style={{ color: point.seriesColor }}>
                    {point.seriesId}: {formatCurrency(point.data.y as number)}
                  </div>
                </div>
              )}
            />
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Distribución de gastos" description="Por categoría">
        {stats.expenseDistribution.length === 0 ? (
          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
            Sin gastos registrados.
          </div>
        ) : (
          <div className="h-[320px]">
            <ResponsivePie
              data={pieData}
              theme={chartTheme}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.55}
              padAngle={2}
              cornerRadius={6}
              colors={{ datum: "data.color" }}
              borderWidth={0}
              arcLinkLabelsColor={{ from: "color" }}
              arcLinkLabelsThickness={2}
              arcLinkLabelsTextColor={chartTheme.colors.foreground}
              arcLabelsTextColor={chartTheme.colors.popoverForeground}
              enableArcLabels={false}
              tooltip={({ datum }) => (
                <div style={{ color: chartTheme.colors.popoverForeground }}>
                  <strong>{datum.id}</strong>
                  <div>{formatCurrency(datum.value)}</div>
                </div>
              )}
            />
          </div>
        )}
      </ChartCard>

      <ChartCard title={titles.distance} description="Distancia recorrida">
        <div className="h-[280px]">
          <ResponsiveLine
            data={distanceData}
            colors={{ datum: "color" }}
            theme={chartTheme}
            margin={{ top: 20, right: 20, bottom: 50, left: 70 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
            curve="monotoneX"
            axisBottom={{
              tickSize: 0,
              tickPadding: 10,
              tickRotation: 0,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 10,
              format: (value) => `${value} km`,
            }}
            enableGridX={false}
            pointSize={6}
            pointBorderWidth={0}
            pointBorderColor={{ from: "seriesColor" }}
            useMesh
            enableSlices={false}
            tooltip={({ point }) => (
              <div style={{ color: chartTheme.colors.popoverForeground }}>
                <strong>{point.data.x as string}</strong>
                <div>{formatNumber(point.data.y as number)} km</div>
              </div>
            )}
          />
        </div>
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
