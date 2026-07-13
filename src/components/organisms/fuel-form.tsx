"use client";

import { useTransition, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fuelCreateSchema, type FuelCreateInput, type FuelUpdateInput } from "@/server/validators/fuel";
import { createFuel, updateFuel } from "@/server/actions/fuel-actions";
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
import type { VehicleOption } from "@/shared/types/vehicle";
import { formatVehicleLabel } from "@/shared/helpers/vehicle";

type FuelFormInitialData = {
  id: string;
  vehicleId: string;
  date: Date | string;
  odometerKm: number;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  fullTank: boolean;
  notes: string | null;
};

type FuelFormProps = {
  vehicles: VehicleOption[];
  initialData?: FuelFormInitialData;
  onSuccess?: () => void;
};

export function FuelForm({ vehicles, initialData, onSuccess }: FuelFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FuelCreateInput>({
    resolver: zodResolver(fuelCreateSchema) as Resolver<FuelCreateInput>,
    defaultValues: initialData
      ? {
          vehicleId: initialData.vehicleId,
          date: formatDateInput(initialData.date) as unknown as Date,
          odometerKm: Number(initialData.odometerKm),
          liters: Number(initialData.liters),
          pricePerLiter: Number(initialData.pricePerLiter),
          totalAmount: Number(initialData.totalAmount),
          fullTank: initialData.fullTank,
          notes: initialData.notes,
        }
      : {
          vehicleId: vehicles[0]?.id ?? "",
          date: formatDateInput(new Date()) as unknown as Date,
          odometerKm: 0,
          liters: 0,
          pricePerLiter: 0,
          totalAmount: 0,
          fullTank: true,
          notes: null,
        },
  });

  const liters = watch("liters");
  const pricePerLiter = watch("pricePerLiter");
  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  useEffect(() => {
    if (liters && pricePerLiter) {
      const total = Math.round(Number(liters) * Number(pricePerLiter) * 100) / 100;
      setValue("totalAmount", total, { shouldValidate: false });
    }
  }, [liters, pricePerLiter, setValue]);

  const onSubmit = (values: FuelCreateInput) => {
    startTransition(async () => {
      const result = initialData
        ? await updateFuel(initialData.id, values as FuelUpdateInput)
        : await createFuel(values);

      if (result.success) {
        toast.success(initialData ? "Carga actualizada" : "Carga registrada");
        if (onSuccess) onSuccess();
        if (!initialData) {
          router.push("/combustible");
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
          value={(watch("vehicleId") ?? "") as string}
          onValueChange={(value) => setValue("vehicleId", value ?? "", { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar vehículo">
              {selectedVehicle ? formatVehicleLabel(selectedVehicle) : "Seleccionar vehículo"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Fecha" error={errors.date?.message}>
        <Input type="date" {...register("date")} />
      </FormField>

      <FormField label="Odómetro (km)" error={errors.odometerKm?.message}>
        <Input type="number" min={0} step={0.1} {...register("odometerKm")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Litros" error={errors.liters?.message}>
          <Input type="number" min={0} step={0.01} {...register("liters")} />
        </FormField>

        <FormField label="Precio por litro" error={errors.pricePerLiter?.message}>
          <Input type="number" min={0} step={0.01} {...register("pricePerLiter")} />
        </FormField>
      </div>

      <FormField label="Monto total" error={errors.totalAmount?.message}>
        <Input type="number" min={0} step={0.01} {...register("totalAmount")} />
      </FormField>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 rounded border-input" {...register("fullTank")} />
        Tanque lleno
      </label>

      <FormField label="Notas" error={errors.notes?.message}>
        <Input {...register("notes")} placeholder="Ej. YPF premium" />
      </FormField>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : initialData ? "Guardar cambios" : "Registrar carga"}
      </Button>
    </form>
  );
}
