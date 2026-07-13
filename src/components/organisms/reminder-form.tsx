"use client";

import { useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { reminderCreateSchema, type ReminderCreateInput, type ReminderUpdateInput } from "@/server/validators/reminder";
import { createReminder, updateReminder } from "@/server/actions/reminder-actions";
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
import { REMINDER_TYPES, REMINDER_TYPE_LABELS, type ReminderType } from "@/shared/constants/reminder-types";
import { REMINDER_ENTITIES, REMINDER_ENTITY_LABELS, type ReminderEntity } from "@/shared/constants/reminder-entities";
import type { VehicleOption } from "@/shared/types/vehicle";

type ReminderFormInitialData = {
  id: string;
  vehicleId: string;
  type: ReminderType;
  entity: ReminderEntity;
  title: string;
  dueDate: Date | string | null;
  dueOdometer: number | null;
  notes: string | null;
};

type ReminderFormProps = {
  vehicles: VehicleOption[];
  initialData?: ReminderFormInitialData;
  onSuccess?: () => void;
};

export function ReminderForm({ vehicles, initialData, onSuccess }: ReminderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReminderCreateInput>({
    resolver: zodResolver(reminderCreateSchema) as Resolver<ReminderCreateInput>,
    defaultValues: initialData
      ? {
          vehicleId: initialData.vehicleId,
          type: initialData.type,
          entity: initialData.entity,
          title: initialData.title,
          dueDate: initialData.dueDate ? (formatDateInput(initialData.dueDate) as unknown as Date) : null,
          dueOdometer: initialData.dueOdometer,
          notes: initialData.notes,
        }
      : {
          vehicleId: vehicles[0]?.id ?? "",
          type: "DATE",
          entity: "SERVICE",
          title: "",
          dueDate: null,
          dueOdometer: null,
          notes: null,
        },
  });

  const onSubmit = (values: ReminderCreateInput) => {
    startTransition(async () => {
      const result = initialData
        ? await updateReminder(initialData.id, values as ReminderUpdateInput)
        : await createReminder(values);

      if (result.success) {
        toast.success(initialData ? "Recordatorio actualizado" : "Recordatorio creado");
        if (onSuccess) onSuccess();
        if (!initialData) {
          router.push("/recordatorios");
        }
      } else {
        toast.error(result.error);
      }
    });
  };

  const type = watch("type");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Vehículo" error={errors.vehicleId?.message}>
        <Select
          value={(watch("vehicleId") ?? "") as string}
          onValueChange={(value) => setValue("vehicleId", value ?? "", { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar vehículo" />
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tipo" error={errors.type?.message}>
          <Select
            value={watch("type")}
            onValueChange={(value) => setValue("type", value as ReminderType, { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REMINDER_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {REMINDER_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Concepto" error={errors.entity?.message}>
          <Select
            value={watch("entity")}
            onValueChange={(value) => setValue("entity", value as ReminderEntity, { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REMINDER_ENTITIES.map((e) => (
                <SelectItem key={e} value={e}>
                  {REMINDER_ENTITY_LABELS[e]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Título" error={errors.title?.message}>
        <Input {...register("title")} placeholder="Ej. Vencimiento seguro" />
      </FormField>

      {type === "DATE" ? (
        <FormField label="Fecha de vencimiento" error={errors.dueDate?.message}>
          <Input type="date" {...register("dueDate")} />
        </FormField>
      ) : (
        <FormField label="Odómetro de vencimiento" error={errors.dueOdometer?.message}>
          <Input type="number" min={0} step={0.1} {...register("dueOdometer")} />
        </FormField>
      )}

      <FormField label="Notas" error={errors.notes?.message}>
        <Input {...register("notes")} placeholder="Observaciones opcionales" />
      </FormField>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : initialData ? "Guardar cambios" : "Crear recordatorio"}
      </Button>
    </form>
  );
}
