"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeReminder } from "@/server/actions/reminder-actions";

type CompleteReminderButtonProps = {
  id: string;
};

export function CompleteReminderButton({ id }: CompleteReminderButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await completeReminder(id);
      if (result.success) {
        toast.success("Recordatorio marcado como completado");
        router.refresh();
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
      aria-label="Completar"
    >
      <Check className="size-4 text-green-600" />
    </Button>
  );
}
