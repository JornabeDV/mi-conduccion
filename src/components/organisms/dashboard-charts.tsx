"use client";

import { ResponsiveBar } from "@nivo/bar";
import { ChartCard } from "@/components/atoms/chart-card";
import { useNivoTheme } from "@/hooks/use-nivo-theme";
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
  income: "var(--chart-income)",
  expenses: "var(--chart-expenses)",
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

function translateKey(key: string): string {
  if (key === "income" || key === "Ingresos") return "Ingresos";
  if (key === "expenses" || key === "Gastos") return "Gastos";
  return key;
}

export function DashboardCharts({
  incomeTrend,
  profitTrend,
  period,
}: DashboardChartsProps) {
  const titles = TREND_TITLES[period];
  const chartTheme = useNivoTheme();

  const incomeData = incomeTrend.map((d) => ({
    label: d.label,
    Ingresos: d.income,
  }));

  const profitData = profitTrend.map((d) => ({
    label: d.label,
    Ingresos: d.income,
    Gastos: d.expenses,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title={titles.income.title} description={titles.income.description}>
        <div className="h-[280px]">
          <ResponsiveBar
            data={incomeData}
            keys={["Ingresos"]}
            indexBy="label"
            colors={COLORS.income}
            margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
            padding={0.3}
            borderRadius={6}
            theme={chartTheme}
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
            gridYValues={5}
            enableLabel={false}
            tooltip={({ value, indexValue }) => (
              <div style={{ color: chartTheme.colors.popoverForeground }}>
                <strong>{indexValue}</strong>
                <div>Ingresos: {formatCurrency(value as number)}</div>
              </div>
            )}
          />
        </div>
      </ChartCard>

      <ChartCard title={titles.profit.title} description={titles.profit.description}>
        <div className="h-[320px]">
          <ResponsiveBar
            data={profitData}
            keys={["Ingresos", "Gastos"]}
            indexBy="label"
            colors={[COLORS.income, COLORS.expenses]}
            margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
            padding={0.3}
            borderRadius={6}
            theme={chartTheme}
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
            gridYValues={5}
            enableLabel={false}
            legends={[
              {
                dataFrom: "keys",
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateY: 50,
                itemsSpacing: 16,
                itemWidth: 80,
                itemHeight: 16,
                itemDirection: "left-to-right",
                symbolSize: 12,
                symbolShape: "circle",
              },
            ]}
            tooltip={({ id, value, indexValue }) => (
              <div style={{ color: chartTheme.colors.popoverForeground }}>
                <strong>{indexValue}</strong>
                <div>{translateKey(id as string)}: {formatCurrency(value as number)}</div>
              </div>
            )}
          />
        </div>
      </ChartCard>
    </div>
  );
}
