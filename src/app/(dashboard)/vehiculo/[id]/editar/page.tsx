import { BackLink } from "@/components/molecules/back-link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { vehicleService } from "@/server/services/vehicle-service";
import { VehicleForm } from "@/components/organisms/vehicle-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditarVehiculoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const { id } = await params;
  const vehicle = await vehicleService.get(id);
  if (!vehicle || vehicle.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href="/vehiculo" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Editar vehículo</h1>
        <p className="text-sm text-muted-foreground">Modificá los datos del vehículo</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos del vehículo</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm
            initialData={{
              id: vehicle.id,
              brand: vehicle.brand,
              model: vehicle.model,
              year: vehicle.year,
              licensePlate: vehicle.licensePlate,
              currentKm: Number(vehicle.currentKm),
              fuelType: vehicle.fuelType,
              tankCapacity: vehicle.tankCapacity ? Number(vehicle.tankCapacity) : null,
              isActive: vehicle.isActive,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
