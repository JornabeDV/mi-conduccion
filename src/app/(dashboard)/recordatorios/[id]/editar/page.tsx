import { BackLink } from "@/components/molecules/back-link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { reminderService } from "@/server/services/reminder-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { ReminderForm } from "@/components/organisms/reminder-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditarRecordatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const { id } = await params;
  const reminder = await reminderService.get(id, session.user.id);
  if (!reminder) {
    notFound();
  }

  const vehicles = await vehicleRepository.findByUser(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href="/recordatorios" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Editar recordatorio</h1>
        <p className="text-sm text-muted-foreground">Modificá el recordatorio</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos del recordatorio</CardTitle>
        </CardHeader>
        <CardContent>
          <ReminderForm
            vehicles={vehicles.map((v) => ({
              id: v.id,
              brand: v.brand,
              model: v.model,
              licensePlate: v.licensePlate,
            }))}
            initialData={{
              id: reminder.id,
              vehicleId: reminder.vehicleId,
              type: reminder.type,
              entity: reminder.entity,
              title: reminder.title,
              dueDate: reminder.dueDate,
              dueOdometer: reminder.dueOdometer ? Number(reminder.dueOdometer) : null,
              notes: reminder.notes,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
