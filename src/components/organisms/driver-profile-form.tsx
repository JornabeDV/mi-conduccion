"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  driverProfileUpdateSchema,
  type DriverProfileUpdateInput,
} from "@/server/validators/driver-profile";
import { updateDriverProfile } from "@/server/actions/driver-profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/molecules/form-field";

type DriverProfileFormProps = {
  initialData: DriverProfileUpdateInput;
};

export function DriverProfileForm({ initialData }: DriverProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DriverProfileUpdateInput>({
    resolver: zodResolver(driverProfileUpdateSchema),
    defaultValues: {
      walletProvider: initialData.walletProvider ?? "",
      walletIdentifier: initialData.walletIdentifier ?? "",
      walletAccountOwner: initialData.walletAccountOwner ?? "",
    },
  });

  const onSubmit = (values: DriverProfileUpdateInput) => {
    startTransition(async () => {
      const result = await updateDriverProfile({
        walletProvider: values.walletProvider || null,
        walletIdentifier: values.walletIdentifier || null,
        walletAccountOwner: values.walletAccountOwner || null,
      });
      if (result.success) {
        toast.success("Perfil actualizado");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Billetera / app de pago" error={errors.walletProvider?.message}>
        <Input {...register("walletProvider")} placeholder="Ej: Naranja X, Mercado Pago" />
      </FormField>

      <FormField label="CVU / Alias / Identificador" error={errors.walletIdentifier?.message}>
        <Input {...register("walletIdentifier")} placeholder="Ej: 0000003100001234567890 o alias.mp" />
      </FormField>

      <FormField label="Titular de la cuenta" error={errors.walletAccountOwner?.message}>
        <Input {...register("walletAccountOwner")} placeholder="Nombre del titular" />
      </FormField>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar datos de billetera"}
      </Button>
    </form>
  );
}
