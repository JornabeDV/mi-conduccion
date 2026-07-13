export const PLATFORMS = [
  "UBER",
  "CABIFY",
  "DIDI",
  "MAXIM",
  "INDRIVE",
  "OTHER",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  UBER: "Uber",
  CABIFY: "Cabify",
  DIDI: "DiDi",
  MAXIM: "Maxim",
  INDRIVE: "InDrive",
  OTHER: "Otra",
};
