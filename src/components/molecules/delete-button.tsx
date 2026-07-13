"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/server/actions/utils";

type DeleteButtonProps = {
  action: () => Promise<ActionResult>;
  onSuccess?: () => void;
  label?: string;
};

export function DeleteButton({ action, onSuccess, label = "Eliminar" }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm(`¿Estás seguro de que querés ${label.toLowerCase()}?`)) return;

    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success("Eliminado correctamente");
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      disabled={isPending}
      aria-label={label}
    >
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
