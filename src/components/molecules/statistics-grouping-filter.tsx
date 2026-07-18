"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  STATISTICS_GROUPINGS,
  type StatisticsGrouping,
} from "@/server/dto/statistics";

export function StatisticsGroupingFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("grouping") as StatisticsGrouping) ?? "week";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("grouping", value);
    router.push(`/estadisticas?${params.toString()}`);
  }

  return (
    <Tabs value={current} onValueChange={handleChange}>
      <TabsList>
        {STATISTICS_GROUPINGS.map((g) => (
          <TabsTrigger key={g.value} value={g.value}>
            {g.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
