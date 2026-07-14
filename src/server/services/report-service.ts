import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { decimalHoursToTimeString } from "@/shared/helpers/time";

function escapeCsv(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsv).join(","));
  }
  return lines.join("\n");
}

export type ReportType = "shifts" | "expenses" | "fuel";

export class ReportService {
  async generateCsv(userId: string, type: ReportType): Promise<{ filename: string; content: string }> {
    if (type === "shifts") {
      const shifts = await prisma.workShift.findMany({
        where: { userId, deletedAt: null },
        include: { incomes: true, vehicle: true },
        orderBy: { date: "desc" },
      });

      const headers = ["Fecha", "Vehículo", "Inicio", "Fin", "Viajes", "Distancia km", "Tiempo en línea", "Ingresos", "Notas"];
      const rows = shifts.map((shift) => {
        const income = shift.incomes.reduce((sum, i) => sum + Number(i.amount), 0);
        return [
          format(shift.date, "yyyy-MM-dd"),
          shift.vehicle ? `${shift.vehicle.brand} ${shift.vehicle.model}` : "",
          format(shift.startedAt, "yyyy-MM-dd HH:mm"),
          shift.endedAt ? format(shift.endedAt, "yyyy-MM-dd HH:mm") : "",
          shift.totalTrips,
          shift.distanceKm ? Number(shift.distanceKm).toFixed(2) : "",
          shift.onlineHours ? decimalHoursToTimeString(Number(shift.onlineHours)) : "",
          income.toFixed(2),
          shift.notes,
        ];
      });

      return { filename: `jornadas.csv`, content: toCsv(headers, rows) };
    }

    if (type === "expenses") {
      const expenses = await prisma.expense.findMany({
        where: { userId, deletedAt: null },
        include: { vehicle: true },
        orderBy: { date: "desc" },
      });

      const headers = ["Fecha", "Vehículo", "Categoría", "Descripción", "Monto"];
      const rows = expenses.map((expense) => [
        format(expense.date, "yyyy-MM-dd"),
        expense.vehicle ? `${expense.vehicle.brand} ${expense.vehicle.model}` : "",
        expense.category,
        expense.description,
        Number(expense.amount).toFixed(2),
      ]);

      return { filename: `gastos.csv`, content: toCsv(headers, rows) };
    }

    const fuelLogs = await prisma.fuelLog.findMany({
      where: { userId, deletedAt: null },
      include: { vehicle: true },
      orderBy: { date: "desc" },
    });

    const headers = ["Fecha", "Vehículo", "Odómetro km", "Litros", "Precio/L", "Total", "Tanque lleno", "Notas"];
    const rows = fuelLogs.map((log) => [
      format(log.date, "yyyy-MM-dd"),
      log.vehicle ? `${log.vehicle.brand} ${log.vehicle.model}` : "",
      Number(log.odometerKm).toFixed(2),
      Number(log.liters).toFixed(3),
      Number(log.pricePerLiter).toFixed(4),
      Number(log.totalAmount).toFixed(2),
      log.fullTank ? "Sí" : "No",
      log.notes,
    ]);

    return { filename: `combustible.csv`, content: toCsv(headers, rows) };
  }
}

export const reportService = new ReportService();
