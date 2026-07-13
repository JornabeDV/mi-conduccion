import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { expenseService } from "@/server/services/expense-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { deleteExpense } from "@/server/actions/expense-actions";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteRowButton } from "@/components/molecules/delete-row-button";
import { formatCurrency, formatDate } from "@/shared/helpers/format";
import { EXPENSE_CATEGORY_LABELS } from "@/shared/constants/expense-categories";
import { Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function GastosPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const [expenses, vehicles] = await Promise.all([
    expenseService.list(session.user.id),
    vehicleRepository.findByUser(session.user.id),
  ]);

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Gastos</h1>
          <p className="text-sm text-muted-foreground">Control de todos tus gastos</p>
        </div>
        <Link href="/gastos/nuevo" className={cn(buttonVariants(), "w-full sm:w-auto")}>
          <Plus className="mr-1 size-4" />
          Nuevo gasto
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
          No hay gastos registrados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => {
                const vehicle = expense.vehicleId ? vehicleMap.get(expense.vehicleId) : null;
                return (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell>{EXPENSE_CATEGORY_LABELS[expense.category]}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}</TableCell>
                    <TableCell>{formatCurrency(Number(expense.amount))}</TableCell>
                    <TableCell className="flex justify-end gap-1">
                      <Link href={`/gastos/${expense.id}/editar`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
                        <Pencil className="size-4" />
                      </Link>
                      <DeleteRowButton action={() => deleteExpense(expense.id)} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
