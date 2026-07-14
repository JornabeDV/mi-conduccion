"use client";

import { useEffect, useTransition } from "react";
import { useForm, useFieldArray, type Resolver, Controller } from "react-hook-form";
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
import { NumericInput } from "@/components/molecules/numeric-input";
import { TimeInput } from "@/components/molecules/time-input";
import { formatCalendarDateInput, formatTimeInput, parseCalendarDateInput } from "@/shared/helpers/format";
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

function calculateOnlineHoursFromTimes(
  date: Date,
  startTime: string,
  endTime: string | null | undefined
): number | null {
  if (!endTime || !startTime) return null;

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  let start = new Date(date);
  start.setHours(startHours, startMinutes, 0, 0);

  let end = new Date(date);
  end.setHours(endHours, endMinutes, 0, 0);

  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  const diffMs = end.getTime() - start.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

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
          date: formatCalendarDateInput(initialData.date) as unknown as Date,
          startTime: formatTimeInput(initialData.startedAt),
          endTime: initialData.endedAt ? formatTimeInput(initialData.endedAt) : null,
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
          vehicleId: vehicles[0]?.id ?? null,
          date: formatCalendarDateInput(new Date()) as unknown as Date,
          startTime: "",
          endTime: null,
          onlineHours: null,
          totalTrips: 0,
          distanceKm: null,
          notes: null,
          incomes: [{ type: "PLATFORM", platform: "UBER", amount: 0, notes: null }],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "incomes" });

  const date = watch("date");
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const onlineHours = watch("onlineHours");

  useEffect(() => {
    if (startTime && endTime && (onlineHours === null || onlineHours === undefined)) {
      const calculated = calculateOnlineHoursFromTimes(new Date(date), startTime, endTime);
      if (calculated !== null) {
        setValue("onlineHours", calculated);
      }
    }
  }, [date, startTime, endTime, onlineHours, setValue]);

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
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Input
                type="date"
                value={formatCalendarDateInput(field.value)}
                onChange={(e) => field.onChange(parseCalendarDateInput(e.target.value))}
              />
            )}
          />
        </FormField>

        <FormField label="Viajes" error={errors.totalTrips?.message}>
          <Controller
            name="totalTrips"
            control={control}
            render={({ field }) => (
              <NumericInput value={field.value} onChange={field.onChange} decimals={0} min={0} />
            )}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Hora de inicio" error={errors.startTime?.message}>
          <Input type="time" {...register("startTime")} />
        </FormField>

        <FormField label="Hora de fin" error={errors.endTime?.message}>
          <Input type="time" {...register("endTime")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tiempo en línea" error={errors.onlineHours?.message}>
          <Controller
            name="onlineHours"
            control={control}
            render={({ field }) => <TimeInput value={field.value} onChange={field.onChange} />}
          />
        </FormField>

        <FormField label="Distancia (km)" error={errors.distanceKm?.message}>
          <Controller
            name="distanceKm"
            control={control}
            render={({ field }) => (
              <NumericInput value={field.value} onChange={field.onChange} decimals={1} min={0} />
            )}
          />
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
                    {INCOME_TYPE_LABELS[watch(`incomes.${index}.type`)]}
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
                      {PLATFORM_LABELS[watch(`incomes.${index}.platform`) ?? "OTHER"]}
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
                <Controller
                  name={`incomes.${index}.amount`}
                  control={control}
                  render={({ field }) => (
                    <NumericInput value={field.value} onChange={field.onChange} decimals={2} min={0} prefix="$ " placeholder="Monto" />
                  )}
                />
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
