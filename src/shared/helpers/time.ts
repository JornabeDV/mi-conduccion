export function decimalHoursToTimeString(
  hours: number | null | undefined,
): string {
  if (hours === null || hours === undefined || Number.isNaN(hours)) {
    return "";
  }

  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeStringToDecimalHours(time: string): number | null {
  const trimmed = time.trim();
  if (!trimmed) return null;

  const [hoursPart, minutesPart] = trimmed.split(":");
  const hours = Number(hoursPart ?? 0);
  const minutes = Number(minutesPart ?? 0);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  return hours + minutes / 60;
}

export function formatDuration(
  hours: number | null | undefined,
): string {
  if (hours === null || hours === undefined || Number.isNaN(hours)) {
    return "—";
  }

  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
