import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { ReminderForm } from "@/components/organisms/reminder-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NuevoRecordatorioPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const vehicles = await vehicleRepository.findByUser(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nuevo recordatorio</h1>
        <p className="text-sm text-muted-foreground">Creá un recordatorio de mantenimiento o vencimiento</p>
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
          />
        </CardContent>
      </Card>
    </div>
  );
}
