import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { historyService } from "@/server/services/history-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/molecules/button-link";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/shared/helpers/format";
import { cn } from "@/lib/utils";

const TYPE_LABELS = {
  SHIFT: "Jornada",
  EXPENSE: "Gasto",
  FUEL: "Combustible",
};

const TYPE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SHIFT: "default",
  EXPENSE: "secondary",
  FUEL: "outline",
};

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string; vehicleId?: string; type?: "SHIFT" | "EXPENSE" | "FUEL" }>;
}) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const params = await searchParams;
  const filters = {
    dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
    dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
    vehicleId: params.vehicleId,
    type: params.type,
  };

  const [items, vehicles] = await Promise.all([
    historyService.getHistory(session.user.id, filters),
    vehicleRepository.findByUser(session.user.id),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Historial</h1>
          <p className="text-sm text-muted-foreground">Movimientos de jornadas, gastos y combustible</p>
        </div>
      </div>

      <form method="get" className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-4 sm:grid-cols-4">
          <div className="grid gap-1">
            <label className="text-xs font-medium">Desde</label>
            <Input type="date" name="dateFrom" defaultValue={params.dateFrom} />
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-medium">Hasta</label>
            <Input type="date" name="dateTo" defaultValue={params.dateTo} />
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-medium">Vehículo</label>
            <select
              name="vehicleId"
              defaultValue={params.vehicleId ?? ""}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
            >
              <option value="">Todos</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-medium">Tipo</label>
            <select
              name="type"
              defaultValue={params.type ?? ""}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="SHIFT">Jornada</option>
              <option value="EXPENSE">Gasto</option>
              <option value="FUEL">Combustible</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="w-full sm:w-auto">
            Filtrar
          </Button>
          <ButtonLink href="/historial" variant="outline" className="w-full sm:w-auto">
            Limpiar
          </ButtonLink>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
          No hay movimientos para los filtros seleccionados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={`${item.type}-${item.id}`}>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>
                    <Badge variant={TYPE_VARIANTS[item.type] ?? "default"}>{TYPE_LABELS[item.type]}</Badge>
                  </TableCell>
                  <TableCell>{item.vehicleName ?? "—"}</TableCell>
                  <TableCell>
                    {item.description}
                    {item.details && <span className="block text-xs text-muted-foreground">{item.details}</span>}
                  </TableCell>
                  <TableCell className={cn("text-right font-medium", item.amount >= 0 ? "text-green-600" : "text-red-600")}>
                    {item.amount >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(item.amount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
