import { BackLink } from "@/components/molecules/back-link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { fuelService } from "@/server/services/fuel-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { FuelForm } from "@/components/organisms/fuel-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditarCargaPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const { id } = await params;
  const log = await fuelService.get(id);
  if (!log || log.userId !== session.user.id) {
    notFound();
  }

  const vehicles = await vehicleRepository.findByUser(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href="/combustible" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Editar carga</h1>
        <p className="text-sm text-muted-foreground">Modificá los datos de la carga</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos de la carga</CardTitle>
        </CardHeader>
        <CardContent>
          <FuelForm
            vehicles={vehicles.map((v) => ({
              id: v.id,
              brand: v.brand,
              model: v.model,
              licensePlate: v.licensePlate,
            }))}
            initialData={{
              id: log.id,
              vehicleId: log.vehicleId,
              date: log.date,
              odometerKm: Number(log.odometerKm),
              liters: Number(log.liters),
              pricePerLiter: Number(log.pricePerLiter),
              totalAmount: Number(log.totalAmount),
              fullTank: log.fullTank,
              notes: log.notes,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
