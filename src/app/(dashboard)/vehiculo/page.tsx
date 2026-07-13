import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { vehicleService } from "@/server/services/vehicle-service";
import { deleteVehicle } from "@/server/actions/vehicle-actions";
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
import { formatNumber } from "@/shared/helpers/format";
import { FUEL_TYPE_LABELS } from "@/shared/constants/fuel-types";
import { Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function VehiculosPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const vehicles = await vehicleService.list(session.user.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Vehículos</h1>
          <p className="text-sm text-muted-foreground">Gestión de tus vehículos</p>
        </div>
        <Link href="/vehiculo/nuevo" className={cn(buttonVariants(), "w-full sm:w-auto")}>
          <Plus className="mr-1 size-4" />
          Nuevo vehículo
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
          No hay vehículos registrados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Patente</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Combustible</TableHead>
                <TableHead>Kilometraje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    {vehicle.brand} {vehicle.model}
                  </TableCell>
                  <TableCell>{vehicle.licensePlate}</TableCell>
                  <TableCell>{vehicle.year ?? "—"}</TableCell>
                  <TableCell>{FUEL_TYPE_LABELS[vehicle.fuelType]}</TableCell>
                  <TableCell>{formatNumber(Number(vehicle.currentKm))} km</TableCell>
                  <TableCell>{vehicle.isActive ? "Activo" : "Inactivo"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex justify-end gap-1">
                      <Link href={`/vehiculo/${vehicle.id}/editar`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
                        <Pencil className="size-4" />
                      </Link>
                      <DeleteRowButton action={deleteVehicle} id={vehicle.id} />
                    </div>
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
