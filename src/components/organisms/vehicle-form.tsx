"use client";

import { useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { vehicleCreateSchema, type VehicleCreateInput, type VehicleUpdateInput } from "@/server/validators/vehicle";
import { createVehicle, updateVehicle } from "@/server/actions/vehicle-actions";
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
import { FUEL_TYPES, FUEL_TYPE_LABELS, type FuelType } from "@/shared/constants/fuel-types";

type VehicleFormInitialData = {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  licensePlate: string;
  currentKm: number;
  fuelType: FuelType;
  tankCapacity: number | null;
  isActive: boolean;
};

type VehicleFormProps = {
  initialData?: VehicleFormInitialData;
  onSuccess?: () => void;
};

export function VehicleForm({ initialData, onSuccess }: VehicleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VehicleCreateInput>({
    resolver: zodResolver(vehicleCreateSchema) as Resolver<VehicleCreateInput>,
    defaultValues: initialData
      ? {
          brand: initialData.brand,
          model: initialData.model,
          year: initialData.year,
          licensePlate: initialData.licensePlate,
          currentKm: initialData.currentKm,
          fuelType: initialData.fuelType,
          tankCapacity: initialData.tankCapacity,
          isActive: initialData.isActive,
        }
      : {
          brand: "",
          model: "",
          year: null,
          licensePlate: "",
          currentKm: 0,
          fuelType: "NAFTA",
          tankCapacity: null,
          isActive: true,
        },
  });

  const onSubmit = (values: VehicleCreateInput) => {
    startTransition(async () => {
      const result = initialData
        ? await updateVehicle(initialData.id, values as VehicleUpdateInput)
        : await createVehicle(values);

      if (result.success) {
        toast.success(initialData ? "Vehículo actualizado" : "Vehículo registrado");
        if (onSuccess) onSuccess();
        if (!initialData) {
          router.push("/vehiculo");
        }
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Marca" error={errors.brand?.message}>
          <Input {...register("brand")} placeholder="Ej. Toyota" />
        </FormField>

        <FormField label="Modelo" error={errors.model?.message}>
          <Input {...register("model")} placeholder="Ej. Etios" />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Año" error={errors.year?.message}>
          <Input type="number" {...register("year")} placeholder="Ej. 2020" />
        </FormField>

        <FormField label="Patente" error={errors.licensePlate?.message}>
          <Input {...register("licensePlate")} placeholder="Ej. ABC123" />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Kilometraje actual" error={errors.currentKm?.message}>
          <Input type="number" min={0} step={0.1} {...register("currentKm")} />
        </FormField>

        <FormField label="Capacidad del tanque (L)" error={errors.tankCapacity?.message}>
          <Input type="number" min={0} step={0.1} {...register("tankCapacity")} placeholder="Opcional" />
        </FormField>
      </div>

      <FormField label="Tipo de combustible" error={errors.fuelType?.message}>
        <Select
          value={watch("fuelType")}
          onValueChange={(value) => setValue("fuelType", value as FuelType, { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FUEL_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {FUEL_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 rounded border-input" {...register("isActive")} />
        Activo
      </label>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : initialData ? "Guardar cambios" : "Registrar vehículo"}
      </Button>
    </form>
  );
}
