import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { goalService } from "@/server/services/goal-service";
import { deleteGoal } from "@/server/actions/goal-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DeleteRowButton } from "@/components/molecules/delete-row-button";
import { formatCurrency, formatDate } from "@/shared/helpers/format";
import { GOAL_PERIOD_LABELS } from "@/shared/constants/goal-periods";
import { Plus, Pencil } from "lucide-react";
import { ButtonLink } from "@/components/molecules/button-link";

export default async function ObjetivosPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const goals = await goalService.list(session.user.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Objetivos</h1>
          <p className="text-sm text-muted-foreground">Seguimiento de metas de ingresos</p>
        </div>
        <ButtonLink href="/objetivos/nuevo" className="w-full sm:w-auto">
          <Plus className="mr-1 size-4" />
          Nuevo objetivo
        </ButtonLink>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
          No hay objetivos definidos.
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="flex flex-col gap-3 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {GOAL_PERIOD_LABELS[goal.period]} — {formatDate(goal.startDate)}
                      {goal.endDate && ` al ${formatDate(goal.endDate)}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <ButtonLink href={`/objetivos/${goal.id}/editar`} variant="ghost" size="icon-sm">
                      <Pencil className="size-4" />
                    </ButtonLink>
                    <DeleteRowButton action={deleteGoal} id={goal.id} />
                  </div>
                </div>
                <Progress value={goal.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {goal.percentage.toFixed(0)}% completado · faltan {formatCurrency(goal.remaining)}
                  {!goal.isActive && " · inactivo"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
