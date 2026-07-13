"use client";

import { useTransition } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  workShiftCreateSchema,
  type WorkShiftCreateInput,
  type WorkShiftUpdateInput,
} from "@/server/validators/workshift";
import { createWorkShift, updateWorkShift } from "@/server/actions/workshift-actions";
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
import { formatDateInput, formatDateTimeInput } from "@/shared/helpers/format";
import { INCOME_TYPES, INCOME_TYPE_LABELS, type IncomeType } from "@/shared/constants/income-types";
import { PLATFORMS, PLATFORM_LABELS, type Platform } from "@/shared/constants/platforms";
import type { VehicleOption } from "@/shared/types/vehicle";
import { formatVehicleLabel } from "@/shared/helpers/vehicle";

type WorkShiftWithIncomes = {
  id: string;
  date: Date;
  startedAt: Date;
  endedAt: Date | null;
  onlineHours: number | null;
  totalTrips: number;
  distanceKm: number | null;
  notes: string | null;
  vehicleId: string | null;
  incomes: {
    type: IncomeType;
    platform: Platform | null;
    amount: number;
    notes: string | null;
  }[];
};

type WorkShiftFormProps = {
  vehicles: VehicleOption[];
  initialData?: WorkShiftWithIncomes;
  onSuccess?: () => void;
};

export function WorkShiftForm({ vehicles, initialData, onSuccess }: WorkShiftFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WorkShiftCreateInput>({
    resolver: zodResolver(workShiftCreateSchema) as Resolver<WorkShiftCreateInput>,
    defaultValues: initialData
      ? {
          vehicleId: initialData.vehicleId ?? null,
          date: formatDateInput(initialData.date) as unknown as Date,
          startedAt: formatDateTimeInput(initialData.startedAt) as unknown as Date,
          endedAt: initialData.endedAt ? (formatDateTimeInput(initialData.endedAt) as unknown as Date) : null,
          onlineHours: initialData.onlineHours,
          totalTrips: initialData.totalTrips,
          distanceKm: initialData.distanceKm,
          notes: initialData.notes,
          incomes: initialData.incomes.map((i) => ({
            ...i,
            platform: i.platform ?? null,
            notes: i.notes ?? null,
          })),
        }
      : {
          vehicleId: null,
          date: formatDateInput(new Date()) as unknown as Date,
          startedAt: formatDateTimeInput(new Date()) as unknown as Date,
          endedAt: null,
          onlineHours: null,
          totalTrips: 0,
          distanceKm: null,
          notes: null,
          incomes: [{ type: "PLATFORM", platform: "UBER", amount: 0, notes: null }],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "incomes" });

  const onSubmit = (values: WorkShiftCreateInput) => {
    startTransition(async () => {
      const result = initialData
        ? await updateWorkShift(initialData.id, values as WorkShiftUpdateInput)
        : await createWorkShift(values);

      if (result.success) {
        toast.success(initialData ? "Jornada actualizada" : "Jornada registrada");
        if (onSuccess) onSuccess();
        if (!initialData) {
          reset();
          router.push("/jornadas");
        }
      } else {
        toast.error(result.error);
      }
    });
  };

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Vehículo" error={errors.vehicleId?.message}>
        <Select
          value={selectedVehicleId ?? ""}
          onValueChange={(value) => setValue("vehicleId", value || null, { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar vehículo">
              {selectedVehicle
                ? formatVehicleLabel(selectedVehicle)
                : selectedVehicleId || "Sin vehículo"}
            </SelectValue>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Fecha" error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </FormField>

        <FormField label="Viajes" error={errors.totalTrips?.message}>
          <Input type="number" min={0} {...register("totalTrips")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Inicio" error={errors.startedAt?.message}>
          <Input type="datetime-local" {...register("startedAt")} />
        </FormField>

        <FormField label="Fin" error={errors.endedAt?.message}>
          <Input type="datetime-local" {...register("endedAt")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Horas en línea" error={errors.onlineHours?.message}>
          <Input type="number" min={0} step={0.1} {...register("onlineHours")} />
        </FormField>

        <FormField label="Distancia (km)" error={errors.distanceKm?.message}>
          <Input type="number" min={0} step={0.1} {...register("distanceKm")} />
        </FormField>
      </div>

      <FormField label="Notas" error={errors.notes?.message}>
        <Input {...register("notes")} placeholder="Observaciones opcionales" />
      </FormField>

      <div className="space-y-3 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Ingresos</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ type: "PLATFORM", platform: "UBER", amount: 0, notes: null })}
          >
            <Plus className="mr-1 size-4" />
            Agregar
          </Button>
        </div>

        {fields.map((field, index) => {
          const type = watch(`incomes.${index}.type`);
          return (
            <div key={field.id} className="grid gap-3 rounded-md bg-muted/40 p-3 sm:grid-cols-12">
              <div className="sm:col-span-3">
                <Select
                  value={watch(`incomes.${index}.type`)}
                  onValueChange={(value) =>
                    setValue(`incomes.${index}.type`, value as IncomeType, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOME_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {INCOME_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {type === "PLATFORM" && (
                <div className="sm:col-span-3">
                  <Select
                    value={watch(`incomes.${index}.platform`) ?? "OTHER"}
                    onValueChange={(value) =>
                      setValue(`incomes.${index}.platform`, value as Platform, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PLATFORM_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className={type === "PLATFORM" ? "sm:col-span-3" : "sm:col-span-6"}>
                <Input type="number" min={0} step={0.01} placeholder="Monto" {...register(`incomes.${index}.amount`)} />
              </div>

              <div className="sm:col-span-2">
                <Input placeholder="Nota" {...register(`incomes.${index}.notes`)} />
              </div>

              <div className="flex items-end justify-end sm:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : initialData ? "Guardar cambios" : "Registrar jornada"}
      </Button>
    </form>
  );
}
