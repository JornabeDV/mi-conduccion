"use client";

import { useTransition } from "react";
import { useForm, type Resolver, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { goalCreateSchema, type GoalCreateInput, type GoalUpdateInput } from "@/server/validators/goal";
import { createGoal, updateGoal } from "@/server/actions/goal-actions";
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
import { NumericInput } from "@/components/molecules/numeric-input";
import { formatDateInput } from "@/shared/helpers/format";
import { GOAL_PERIODS, GOAL_PERIOD_LABELS, type GoalPeriod } from "@/shared/constants/goal-periods";

type GoalFormInitialData = {
  id: string;
  period: GoalPeriod;
  targetAmount: number;
  startDate: Date | string;
  endDate: Date | string | null;
  isActive: boolean;
};

type GoalFormProps = {
  initialData?: GoalFormInitialData;
  onSuccess?: () => void;
};

export function GoalForm({ initialData, onSuccess }: GoalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GoalCreateInput>({
    resolver: zodResolver(goalCreateSchema) as Resolver<GoalCreateInput>,
    defaultValues: initialData
      ? {
          period: initialData.period,
          targetAmount: initialData.targetAmount,
          startDate: formatDateInput(initialData.startDate) as unknown as Date,
          endDate: initialData.endDate ? (formatDateInput(initialData.endDate) as unknown as Date) : null,
          isActive: initialData.isActive,
        }
      : {
          period: "DAILY",
          targetAmount: 0,
          startDate: formatDateInput(new Date()) as unknown as Date,
          endDate: null,
          isActive: true,
        },
  });

  const onSubmit = (values: GoalCreateInput) => {
    startTransition(async () => {
      const result = initialData
        ? await updateGoal(initialData.id, values as GoalUpdateInput)
        : await createGoal(values);

      if (result.success) {
        toast.success(initialData ? "Objetivo actualizado" : "Objetivo creado");
        if (onSuccess) onSuccess();
        if (!initialData) {
          router.push("/objetivos");
        }
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Período" error={errors.period?.message}>
        <Select
          value={watch("period")}
          onValueChange={(value) => setValue("period", value as GoalPeriod, { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{GOAL_PERIOD_LABELS[watch("period")]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {GOAL_PERIODS.map((period) => (
              <SelectItem key={period} value={period}>
                {GOAL_PERIOD_LABELS[period]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Objetivo de ingresos" error={errors.targetAmount?.message}>
        <Controller
          name="targetAmount"
          control={control}
          render={({ field }) => (
            <NumericInput value={field.value} onChange={field.onChange} decimals={2} min={0} prefix="$ " />
          )}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Fecha de inicio" error={errors.startDate?.message}>
          <Input type="date" {...register("startDate")} />
        </FormField>

        <FormField label="Fecha de fin (opcional)" error={errors.endDate?.message}>
          <Input type="date" {...register("endDate")} />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 rounded border-input" {...register("isActive")} />
        Activo
      </label>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : initialData ? "Guardar cambios" : "Crear objetivo"}
      </Button>
    </form>
  );
}
