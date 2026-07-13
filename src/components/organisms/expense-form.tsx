"use client";

import { useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { expenseCreateSchema, type ExpenseCreateInput, type ExpenseUpdateInput } from "@/server/validators/expense";
import { createExpense, updateExpense } from "@/server/actions/expense-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/molecules/form-field";
import { formatDateInput } from "@/shared/helpers/format";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from "@/shared/constants/expense-categories";
import type { VehicleOption } from "@/shared/types/vehicle";

type ExpenseFormInitialData = {
  id: string;
  vehicleId: string | null;
  category: ExpenseCreateInput["category"];
  date: Date | string;
  description: string;
  amount: number;
};

type ExpenseFormProps = {
  vehicles: VehicleOption[];
  initialData?: ExpenseFormInitialData;
  onSuccess?: () => void;
};

export function ExpenseForm({ vehicles, initialData, onSuccess }: ExpenseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseCreateInput>({
    resolver: zodResolver(expenseCreateSchema) as Resolver<ExpenseCreateInput>,
    defaultValues: initialData
      ? {
          vehicleId: initialData.vehicleId,
          category: initialData.category,
          date: formatDateInput(initialData.date) as unknown as Date,
          description: initialData.description,
          amount: Number(initialData.amount),
        }
      : {
          vehicleId: null,
          category: "OTHER",
          date: formatDateInput(new Date()) as unknown as Date,
          description: "",
          amount: 0,
        },
  });

  const onSubmit = (values: ExpenseCreateInput) => {
    startTransition(async () => {
      const result = initialData
        ? await updateExpense(initialData.id, values as ExpenseUpdateInput)
        : await createExpense(values);

      if (result.success) {
        toast.success(initialData ? "Gasto actualizado" : "Gasto registrado");
        if (onSuccess) onSuccess();
        if (!initialData) {
          router.push("/gastos");
        }
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Vehículo" error={errors.vehicleId?.message}>
        <Select
          value={watch("vehicleId") ?? ""}
          onValueChange={(value) => setValue("vehicleId", value || null, { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar vehículo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sin vehículo</SelectItem>
            {vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Categoría" error={errors.category?.message}>
        <Select
          value={watch("category")}
          onValueChange={(value) =>
            setValue("category", value as ExpenseCreateInput["category"], { shouldValidate: true })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {EXPENSE_CATEGORY_LABELS[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Fecha" error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </FormField>

        <FormField label="Monto" error={errors.amount?.message}>
          <Input type="number" min={0} step={0.01} {...register("amount")} />
        </FormField>
      </div>

      <FormField label="Descripción" error={errors.description?.message}>
        <Input {...register("description")} placeholder="Ej. Peaje ruta 9" />
      </FormField>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : initialData ? "Guardar cambios" : "Registrar gasto"}
      </Button>
    </form>
  );
}
