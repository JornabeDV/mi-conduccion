"use client";

import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/molecules/delete-button";
import type { ActionResult } from "@/server/actions/utils";

type DeleteRowButtonProps = {
  action: (id: string) => Promise<ActionResult>;
  id: string;
  label?: string;
};

export function DeleteRowButton({ action, id, label }: DeleteRowButtonProps) {
  const router = useRouter();
  return <DeleteButton action={() => action(id)} onSuccess={() => router.refresh()} label={label} />;
}
