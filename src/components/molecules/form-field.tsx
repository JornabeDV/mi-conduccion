"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label className={cn(error && "text-destructive")}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
