"use client";

import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/molecules/delete-button";
import type { ActionResult } from "@/server/actions/utils";

type DeleteRowButtonProps = {
  action: () => Promise<ActionResult>;
  label?: string;
};

export function DeleteRowButton({ action, label }: DeleteRowButtonProps) {
  const router = useRouter();
  return <DeleteButton action={action} onSuccess={() => router.refresh()} label={label} />;
}
