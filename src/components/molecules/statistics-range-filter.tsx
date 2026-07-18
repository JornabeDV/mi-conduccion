"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  STATISTICS_RANGES,
  type StatisticsRange,
} from "@/server/dto/statistics";

export function StatisticsRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("range") as StatisticsRange) ?? "3m";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("range", value);
    router.push(`/estadisticas?${params.toString()}`);
  }

  return (
    <Tabs value={current} onValueChange={handleChange}>
      <TabsList>
        {STATISTICS_RANGES.map((r) => (
          <TabsTrigger key={r.value} value={r.value}>
            {r.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
