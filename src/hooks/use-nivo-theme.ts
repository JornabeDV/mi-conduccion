"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";

export function useNivoTheme() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return useMemo(
    () => ({
      colors: {
        foreground: isDark ? "#f9fafb" : "#111827",
        mutedForeground: isDark ? "#9ca3af" : "#6b7280",
        border: isDark ? "#374151" : "#e5e7eb",
        popover: isDark ? "#1f2937" : "#ffffff",
        popoverForeground: isDark ? "#f9fafb" : "#111827",
      },
      axis: {
        ticks: {
          text: {
            fill: isDark ? "#e5e7eb" : "#6b7280",
            fontSize: 11,
          },
          line: { stroke: "transparent" },
        },
        domain: { line: { stroke: "transparent" } },
      },
      grid: {
        line: { stroke: isDark ? "#374151" : "#e5e7eb", strokeDasharray: "3 3" },
      },
      tooltip: {
        container: {
          background: isDark ? "#1f2937" : "#ffffff",
          color: isDark ? "#f9fafb" : "#111827",
          border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 12,
        },
      },
      legends: {
        text: { fill: isDark ? "#f9fafb" : "#111827", fontSize: 12 },
      },
      crosshair: {
        line: { stroke: isDark ? "#9ca3af" : "#6b7280", strokeOpacity: 0.3 },
      },
    }),
    [isDark],
  );
}
