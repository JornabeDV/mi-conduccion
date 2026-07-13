import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { reminderService } from "@/server/services/reminder-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { deleteReminder } from "@/server/actions/reminder-actions";
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
import { CompleteReminderButton } from "@/components/molecules/complete-reminder-button";
import { formatDate, formatNumber } from "@/shared/helpers/format";
import { REMINDER_TYPE_LABELS } from "@/shared/constants/reminder-types";
import { REMINDER_ENTITY_LABELS } from "@/shared/constants/reminder-entities";
import { Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function RecordatoriosPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const [reminders, vehicles] = await Promise.all([
    reminderService.list(session.user.id),
    vehicleRepository.findByUser(session.user.id),
  ]);

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Recordatorios</h1>
          <p className="text-sm text-muted-foreground">Mantenimiento y vencimientos</p>
        </div>
        <Link href="/recordatorios/nuevo" className={cn(buttonVariants(), "w-full sm:w-auto")}>
          <Plus className="mr-1 size-4" />
          Nuevo recordatorio
        </Link>
      </div>

      {reminders.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
          No hay recordatorios.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((reminder) => {
                const vehicle = vehicleMap.get(reminder.vehicleId);
                return (
                  <TableRow key={reminder.id} data-state={reminder.isCompleted ? "selected" : undefined}>
                    <TableCell>{reminder.title}</TableCell>
                    <TableCell>{vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}</TableCell>
                    <TableCell>{REMINDER_TYPE_LABELS[reminder.type]}</TableCell>
                    <TableCell>{REMINDER_ENTITY_LABELS[reminder.entity]}</TableCell>
                    <TableCell>
                      {reminder.type === "DATE"
                        ? formatDate(reminder.dueDate)
                        : `${formatNumber(Number(reminder.dueOdometer))} km`}
                    </TableCell>
                    <TableCell>{reminder.isCompleted ? "Completado" : "Pendiente"}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex justify-end gap-1">
                        {!reminder.isCompleted && <CompleteReminderButton id={reminder.id} />}
                        <Link href={`/recordatorios/${reminder.id}/editar`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
                          <Pencil className="size-4" />
                        </Link>
                        <DeleteRowButton action={deleteReminder} id={reminder.id} />
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
