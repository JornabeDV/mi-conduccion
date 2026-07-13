import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalForm } from "@/components/organisms/goal-form";

export default function NuevoObjetivoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nuevo objetivo</h1>
        <p className="text-sm text-muted-foreground">Definí una meta de ingresos</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos del objetivo</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalForm />
        </CardContent>
      </Card>
    </div>
  );
}
