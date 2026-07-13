import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleForm } from "@/components/organisms/vehicle-form";

export default function NuevoVehiculoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nuevo vehículo</h1>
        <p className="text-sm text-muted-foreground">Completá los datos del vehículo</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos del vehículo</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm />
        </CardContent>
      </Card>
    </div>
  );
}
