import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { fuelService } from "@/server/services/fuel-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { deleteFuel } from "@/server/actions/fuel-actions";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteRowButton } from "@/components/molecules/delete-row-button";
import { formatCurrency, formatDate, formatNumber } from "@/shared/helpers/format";
import { Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function CombustiblePage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const [logs, vehicles] = await Promise.all([
    fuelService.list(session.user.id),
    vehicleRepository.findByUser(session.user.id),
  ]);

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Combustible</h1>
          <p className="text-sm text-muted-foreground">Seguimiento de cargas y rendimiento</p>
        </div>
        <Link href="/combustible/nuevo" className={cn(buttonVariants(), "w-full sm:w-auto")}>
          <Plus className="mr-1 size-4" />
          Nueva carga
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
          No hay cargas registradas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Odómetro</TableHead>
                <TableHead>Litros</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Rendimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const vehicle = log.vehicleId ? vehicleMap.get(log.vehicleId) : null;
                return (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.date)}</TableCell>
                    <TableCell>{vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}</TableCell>
                    <TableCell>{formatNumber(Number(log.odometerKm))} km</TableCell>
                    <TableCell>{formatNumber(Number(log.liters))} L</TableCell>
                    <TableCell>{formatCurrency(Number(log.totalAmount))}</TableCell>
                    <TableCell>
                      {log.efficiencyKmPerL ? `${formatNumber(Number(log.efficiencyKmPerL))} km/L` : "—"}
                    </TableCell>
                    <TableCell className="flex justify-end gap-1">
                      <Link href={`/combustible/${log.id}/editar`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
                        <Pencil className="size-4" />
                      </Link>
                      <DeleteRowButton action={() => deleteFuel(log.id)} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
