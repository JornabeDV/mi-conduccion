import { BackLink } from "@/components/molecules/back-link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { workShiftService } from "@/server/services/workshift-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { WorkShiftForm } from "@/components/organisms/workshift-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditarJornadaPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const { id } = await params;
  const shift = await workShiftService.get(id);
  if (!shift || shift.userId !== session.user.id) {
    notFound();
  }

  const vehicles = await vehicleRepository.findByUser(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href="/jornadas" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Editar jornada</h1>
        <p className="text-sm text-muted-foreground">Modificá los datos de la jornada</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos de la jornada</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkShiftForm
            vehicles={vehicles.map((v) => ({ id: v.id, brand: v.brand, model: v.model, licensePlate: v.licensePlate }))}
            initialData={{
              id: shift.id,
              date: shift.date,
              startedAt: shift.startedAt,
              endedAt: shift.endedAt,
              onlineHours: shift.onlineHours ? Number(shift.onlineHours) : null,
              totalTrips: shift.totalTrips,
              distanceKm: shift.distanceKm ? Number(shift.distanceKm) : null,
              notes: shift.notes,
              vehicleId: shift.vehicleId,
              incomes: shift.incomes.map((income) => ({
                type: income.type,
                platform: income.platform,
                amount: Number(income.amount),
                notes: income.notes,
              })),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
