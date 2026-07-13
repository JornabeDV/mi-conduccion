import { BackLink } from "@/components/molecules/back-link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { WorkShiftForm } from "@/components/organisms/workshift-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NuevaJornadaPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const vehicles = await vehicleRepository.findByUser(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href="/jornadas" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nueva jornada</h1>
        <p className="text-sm text-muted-foreground">Completá los datos de tu jornada</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos de la jornada</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkShiftForm
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
