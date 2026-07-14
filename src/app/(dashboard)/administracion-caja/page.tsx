import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { workShiftService } from "@/server/services/workshift-service";
import { cashCountService } from "@/server/services/cash-count-service";
import { ButtonLink } from "@/components/molecules/button-link";
import { formatCurrency, formatCalendarDate } from "@/shared/helpers/format";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdministracionCajaPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const shifts = await workShiftService.list(session.user.id);

  const shiftsWithSummary = await Promise.all(
    shifts.map(async (shift) => {
      const summary = await cashCountService.getByShift(session.user.id, shift.id);
      return { shift, summary };
    })
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Administración caja</h1>
          <p className="text-sm text-muted-foreground">Control de efectivo, transferencias y pagos por app</p>
        </div>
        <ButtonLink href="/administracion-caja/nueva-apertura" className="w-full sm:w-auto">
          <Plus className="mr-1 size-4" />
          Nueva apertura
        </ButtonLink>
      </div>

      {shiftsWithSummary.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
          No hay jornadas registradas. Cargá una jornada para empezar a controlar la caja.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Efectivo</TableHead>
                <TableHead>Transferencia</TableHead>
                <TableHead>App</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shiftsWithSummary.map(({ shift, summary }) => {
                const hasOpen = !!summary.open;
                const hasClose = !!summary.close;
                const status = !hasOpen && !hasClose ? "Pendiente" : hasClose ? "Completo" : "Solo apertura";

                return (
                  <TableRow key={shift.id}>
                    <TableCell>{formatCalendarDate(shift.date)}</TableCell>
                    <TableCell>{shift.vehicleName ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={hasClose ? "default" : hasOpen ? "outline" : "secondary"}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(summary.cashEarnings)}</TableCell>
                    <TableCell>{formatCurrency(summary.transferEarnings)}</TableCell>
                    <TableCell>{formatCurrency(summary.appEarnings)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(summary.totalBalance)}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex justify-end gap-2">
                        <ButtonLink
                          href={`/administracion-caja/${shift.id}?type=OPEN`}
                          variant={hasOpen ? "outline" : "default"}
                          size="sm"
                        >
                          {hasOpen ? "Editar apertura" : "Cargar apertura"}
                        </ButtonLink>
                        <ButtonLink
                          href={`/administracion-caja/${shift.id}?type=CLOSE`}
                          variant={hasClose ? "outline" : "default"}
                          size="sm"
                        >
                          {hasClose ? "Editar cierre" : "Cargar cierre"}
                        </ButtonLink>
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
