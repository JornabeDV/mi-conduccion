"use client";

import { useTransition, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { saveCashCount } from "@/server/actions/cash-count-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/molecules/form-field";
import { NumericInput } from "@/components/molecules/numeric-input";
import { DEFAULT_DENOMINATIONS } from "@/shared/constants/denominations";
import {
  formatCurrency,
  formatCalendarDateInput,
  parseCalendarDateInput,
} from "@/shared/helpers/format";
import type { CashCountType } from "@prisma/client";
import type { CashCountCreateInput } from "@/server/validators/cash-count";

const TYPE_LABELS: Record<CashCountType, string> = {
  OPEN: "Apertura",
  CLOSE: "Cierre",
};

const denominationFormSchema = z.object({
  value: z.number(),
  quantity: z.number().int().nonnegative(),
  label: z.string(),
});

const formSchema = z.object({
  shiftId: z.string().uuid(),
  type: z.enum(["OPEN", "CLOSE"]),
  date: z.string().min(1, "La fecha es requerida"),
  denominations: z.array(denominationFormSchema),
  transferAmount: z.number().nonnegative().nullable().optional(),
  appAmount: z.number().nullable().optional(),
  extraAmount: z.number().nonnegative().nullable().optional(),
  notes: z.string().max(500).optional(),
});

type CashCountFormValues = z.infer<typeof formSchema>;

type CashCountFormProps = {
  shiftId: string;
  type: CashCountType;
  shiftDate: Date;
  walletProvider?: string | null;
  initialData?: {
    date: Date;
    denominations: { value: number; quantity: number; label: string }[];
    transferAmount: number | null;
    appAmount: number | null;
    extraAmount: number | null;
    notes: string | null;
  } | null;
  onSuccess?: () => void;
};

export function CashCountForm({ shiftId, type, shiftDate, walletProvider, initialData, onSuccess }: CashCountFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultDenominations = useMemo(() => {
    const map = new Map<number, number>();
    DEFAULT_DENOMINATIONS.forEach((d) => map.set(d.value, 0));
    if (initialData) {
      initialData.denominations.forEach((d) => map.set(d.value, d.quantity));
    }
    return DEFAULT_DENOMINATIONS.map((d) => ({
      value: d.value,
      label: d.label,
      quantity: map.get(d.value) ?? 0,
    }));
  }, [initialData]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CashCountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shiftId,
      type,
      date: initialData ? formatCalendarDateInput(initialData.date) : formatCalendarDateInput(shiftDate),
      denominations: defaultDenominations,
      transferAmount: initialData?.transferAmount ?? null,
      appAmount: initialData?.appAmount ?? null,
      extraAmount: initialData?.extraAmount ?? null,
      notes: initialData?.notes ?? "",
    },
  });

  const denominations = useWatch({ control, name: "denominations" });
  const transferAmount = watch("transferAmount") ?? 0;
  const appAmount = watch("appAmount") ?? 0;

  const cashTotal = useMemo(() => {
    return (denominations ?? []).reduce((sum, d) => sum + d.value * d.quantity, 0);
  }, [denominations]);

  const total = cashTotal + transferAmount + appAmount;

  const onSubmit = (values: CashCountFormValues) => {
    const payload: CashCountCreateInput = {
      shiftId: values.shiftId,
      type: values.type,
      date: parseCalendarDateInput(values.date),
      denominations: values.denominations,
      transferAmount: values.transferAmount ?? null,
      appAmount: values.appAmount ?? null,
      extraAmount: values.type === "CLOSE" ? values.extraAmount ?? null : null,
      notes: values.notes || null,
    };

    startTransition(async () => {
      const result = await saveCashCount(payload);
      if (result.success) {
        toast.success(`${TYPE_LABELS[type]} guardada`);
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("shiftId")} />
      <input type="hidden" {...register("type")} />

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
        <span className="text-sm font-medium">Total {TYPE_LABELS[type].toLowerCase()}</span>
        <span className="text-xl font-bold">{formatCurrency(total)}</span>
      </div>

      {type === "CLOSE" && (
        <FormField label="Extra / propinas / ajuste" error={errors.extraAmount?.message}>
          <Controller
            name="extraAmount"
            control={control}
            render={({ field }) => (
              <NumericInput
                value={field.value}
                onChange={field.onChange}
                decimals={2}
                min={0}
                prefix="$ "
                placeholder="Monto adicional en efectivo"
              />
            )}
          />
        </FormField>
      )}

      <FormField label="Notas" error={errors.notes?.message}>
        <Input {...register("notes")} placeholder="Observaciones opcionales" />
      </FormField>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : `Guardar ${TYPE_LABELS[type].toLowerCase()}`}
      </Button>
    </form>
  );
}
