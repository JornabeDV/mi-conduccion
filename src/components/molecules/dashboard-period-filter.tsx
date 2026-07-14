"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DashboardPeriod } from "@/server/dto/dashboard";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

export function DashboardPeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("period") as DashboardPeriod) ?? "day";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("period", value);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <Tabs value={current} onValueChange={handleChange}>
      <TabsList>
        {PERIODS.map((p) => (
          <TabsTrigger key={p.value} value={p.value}>
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
