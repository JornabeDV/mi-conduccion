"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import type { ActionResult } from "@/server/actions/utils";

type DeleteButtonProps = {
  action: () => Promise<ActionResult>;
  onSuccess?: () => void;
  label?: string;
};

export function DeleteButton({ action, onSuccess, label = "Eliminar" }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success("Eliminado correctamente");
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        disabled={isPending}
        aria-label={label}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Eliminar?"
        description={`¿Estás seguro de que querés ${label.toLowerCase()}? Esta acción no se puede deshacer.`}
        confirmLabel={label}
        cancelLabel="Cancelar"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
