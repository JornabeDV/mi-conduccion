"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatCalendarDateInput,
  parseCalendarDateInput,
} from "@/shared/helpers/format";
import type { DashboardPeriod } from "@/server/dto/dashboard";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

type DashboardFiltersProps = {
  period: DashboardPeriod;
  date: Date;
};

export function DashboardFilters({ period, date }: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(updates)) {
      params.set(key, value);
    }

    router.push(`/dashboard?${params.toString()}`);
  }

  function handlePeriodChange(value: string) {
    updateParams({ period: value });
  }

  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (!value) return;

    const parsed = parseCalendarDateInput(value);
    updateParams({ date: formatCalendarDateInput(parsed) });
  }

  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <Tabs value={period} onValueChange={handlePeriodChange}>
        <TabsList>
          {PERIODS.map((p) => (
            <TabsTrigger key={p.value} value={p.value}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative">
        <Calendar className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="date"
          value={formatCalendarDateInput(date)}
          onChange={handleDateChange}
          className="h-8 w-full rounded-lg border border-input bg-background px-8 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-auto"
        />
      </div>
    </div>
  );
}
