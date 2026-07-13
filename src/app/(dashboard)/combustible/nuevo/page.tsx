import { BackLink } from "@/components/molecules/back-link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { FuelForm } from "@/components/organisms/fuel-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NuevaCargaPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const vehicles = await vehicleRepository.findByUser(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href="/combustible" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nueva carga</h1>
        <p className="text-sm text-muted-foreground">Registrá una carga de combustible</p>
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
          />
        </CardContent>
      </Card>
    </div>
  );
}
