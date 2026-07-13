import { BackLink } from "@/components/molecules/back-link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { goalService } from "@/server/services/goal-service";
import { GoalForm } from "@/components/organisms/goal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditarObjetivoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const { id } = await params;
  const goal = await goalService.get(id, session.user.id);
  if (!goal) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href="/objetivos" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Editar objetivo</h1>
        <p className="text-sm text-muted-foreground">Modificá la meta de ingresos</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos del objetivo</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalForm
            initialData={{
              id: goal.id,
              period: goal.period,
              targetAmount: goal.targetAmount,
              startDate: goal.startDate,
              endDate: goal.endDate,
              isActive: goal.isActive,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
