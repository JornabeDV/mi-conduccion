import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { fuelService } from "@/server/services/fuel-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { deleteFuel } from "@/server/actions/fuel-actions";
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
import { ButtonLink } from "@/components/molecules/button-link";

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
        <ButtonLink href="/combustible/nuevo" className="w-full sm:w-auto">
          <Plus className="mr-1 size-4" />
          Nueva carga
        </ButtonLink>
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
                    <TableCell className="text-right">
                      <div className="inline-flex justify-end gap-1">
                        <ButtonLink href={`/combustible/${log.id}/editar`} variant="ghost" size="icon-sm">
                          <Pencil className="size-4" />
                        </ButtonLink>
                        <DeleteRowButton action={deleteFuel} id={log.id} />
                      </div>
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
