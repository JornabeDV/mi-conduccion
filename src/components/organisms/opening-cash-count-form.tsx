"use client";

import { useTransition, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { saveOpeningCashCount } from "@/server/actions/cash-count-opening-actions";
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
import { DEFAULT_DENOMINATIONS } from "@/shared/constants/denominations";
import {
  formatCurrency,
  formatCalendarDateInput,
  parseCalendarDateInput,
} from "@/shared/helpers/format";
import type { VehicleOption } from "@/shared/types/vehicle";
import { formatVehicleLabel } from "@/shared/helpers/vehicle";

const denominationFormSchema = z.object({
  value: z.number(),
  quantity: z.number().int().nonnegative(),
  label: z.string(),
});

const formSchema = z.object({
  vehicleId: z.string().uuid("Seleccioná un vehículo"),
  date: z.string().min(1, "La fecha es requerida"),
  denominations: z.array(denominationFormSchema),
  transferAmount: z.number().nonnegative().nullable().optional(),
  appAmount: z.number().nullable().optional(),
  notes: z.string().max(500).optional(),
});

type OpeningCashCountFormValues = z.infer<typeof formSchema>;

type OpeningCashCountFormProps = {
  vehicles: VehicleOption[];
  walletProvider?: string | null;
};

export function OpeningCashCountForm({ vehicles, walletProvider }: OpeningCashCountFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultDenominations = useMemo(() => {
    return DEFAULT_DENOMINATIONS.map((d) => ({
      value: d.value,
      label: d.label,
      quantity: 0,
    }));
  }, []);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OpeningCashCountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: vehicles[0]?.id ?? "",
      date: formatCalendarDateInput(new Date()),
      denominations: defaultDenominations,
      transferAmount: null,
      appAmount: null,
      notes: "",
    },
  });

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const denominations = useWatch({ control, name: "denominations" });
  const transferAmount = watch("transferAmount") ?? 0;
  const appAmount = watch("appAmount") ?? 0;

  const cashTotal = useMemo(() => {
    return (denominations ?? []).reduce((sum, d) => sum + d.value * d.quantity, 0);
  }, [denominations]);

  const total = cashTotal + transferAmount + appAmount;

  const onSubmit = (values: OpeningCashCountFormValues) => {
    startTransition(async () => {
      const result = await saveOpeningCashCount({
        vehicleId: values.vehicleId,
        date: parseCalendarDateInput(values.date),
        denominations: values.denominations,
        transferAmount: values.transferAmount ?? null,
        appAmount: values.appAmount ?? null,
        notes: values.notes || null,
      });
      if (result.success) {
        toast.success("Apertura guardada");
        router.push("/administracion-caja");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Vehículo" error={errors.vehicleId?.message}>
        <Select
          value={selectedVehicleId}
          onValueChange={(value) => value && setValue("vehicleId", value, { shouldValidate: true })}
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

      <div className="space-y-2">
        <span className="text-sm font-medium">Billetes</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {DEFAULT_DENOMINATIONS.map((d, index) => (
            <div
              key={d.value}
              className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3"
            >
              <span className="w-20 text-sm font-medium">{d.label}</span>
              <span className="text-sm text-muted-foreground">×</span>
              <Controller
                name={`denominations.${index}.quantity` as const}
                control={control}
                render={({ field }) => (
                  <NumericInput
                    value={field.value}
                    onChange={field.onChange}
                    decimals={0}
                    min={0}
                    className="flex-1"
                  />
                )}
              />
              <span className="w-20 text-right text-sm tabular-nums">
                {formatCurrency(d.value * denominations[index].quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <FormField label={`Billetera virtual${walletProvider ? ` (${walletProvider})` : ""}`} error={errors.transferAmount?.message}>
        <Controller
          name="transferAmount"
          control={control}
          render={({ field }) => (
            <NumericInput
              value={field.value}
              onChange={field.onChange}
              decimals={2}
              min={0}
              prefix="$ "
              placeholder="Monto en billetera virtual"
            />
          )}
        />
      </FormField>

      <FormField label="Pago por APP" error={errors.appAmount?.message}>
        <Controller
          name="appAmount"
          control={control}
          render={({ field }) => (
            <NumericInput
              value={field.value}
              onChange={field.onChange}
              decimals={2}
              allowNegative
              prefix="$ "
              placeholder="Monto en apps de pago (puede ser negativo)"
            />
          )}
        />
      </FormField>

      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <span className="text-sm font-medium">Total apertura</span>
        <span className="text-xl font-bold">{formatCurrency(total)}</span>
      </div>

      <FormField label="Notas" error={errors.notes?.message}>
        <Input {...register("notes")} placeholder="Observaciones opcionales" />
      </FormField>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar apertura"}
      </Button>
    </form>
  );
}
