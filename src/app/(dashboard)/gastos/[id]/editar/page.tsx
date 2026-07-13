import { BackLink } from "@/components/molecules/back-link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { expenseService } from "@/server/services/expense-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { ExpenseForm } from "@/components/organisms/expense-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditarGastoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const { id } = await params;
  const expense = await expenseService.get(id);
  if (!expense || expense.userId !== session.user.id) {
    notFound();
  }

  const vehicles = await vehicleRepository.findByUser(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href="/gastos" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Editar gasto</h1>
        <p className="text-sm text-muted-foreground">Modificá los datos del gasto</p>
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
            initialData={{
              id: expense.id,
              vehicleId: expense.vehicleId,
              category: expense.category,
              date: expense.date,
              description: expense.description,
              amount: Number(expense.amount),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
