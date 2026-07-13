import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { workShiftService } from "@/server/services/workshift-service";
import { deleteWorkShift } from "@/server/actions/workshift-actions";
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

export default async function JornadasPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const shifts = await workShiftService.list(session.user.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Jornadas</h1>
          <p className="text-sm text-muted-foreground">Registro de tus jornadas de trabajo</p>
        </div>
        <Link href="/jornadas/nuevo" className={cn(buttonVariants(), "w-full sm:w-auto")}>
          <Plus className="mr-1 size-4" />
          Nueva jornada
        </Link>
      </div>

      {shifts.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
          No hay jornadas registradas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Viajes</TableHead>
                <TableHead>Distancia</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Ingresos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{formatDate(shift.date)}</TableCell>
                  <TableCell>{shift.vehicleName ?? "—"}</TableCell>
                  <TableCell>{shift.totalTrips}</TableCell>
                  <TableCell>{formatNumber(shift.distanceKm)} km</TableCell>
                  <TableCell>{formatNumber(shift.onlineHours)} h</TableCell>
                  <TableCell>{formatCurrency(shift.totalIncome)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex justify-end gap-1">
                      <Link href={`/jornadas/${shift.id}/editar`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
                        <Pencil className="size-4" />
                      </Link>
                      <DeleteRowButton action={deleteWorkShift} id={shift.id} />
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
