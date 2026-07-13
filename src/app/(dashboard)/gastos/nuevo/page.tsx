import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { ExpenseForm } from "@/components/organisms/expense-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NuevoGastoPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const vehicles = await vehicleRepository.findByUser(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nuevo gasto</h1>
        <p className="text-sm text-muted-foreground">Registrá un gasto de tu actividad</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos del gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm
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
