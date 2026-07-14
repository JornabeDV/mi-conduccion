"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  decimalHoursToTimeString,
  timeStringToDecimalHours,
} from "@/shared/helpers/time";

type TimeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "ref" | "defaultValue"
> & {
  value?: number | null;
  onChange?: (value: number | null) => void;
};

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(timeStringToDecimalHours(event.target.value));
    };

    return (
      <Input
        ref={ref}
        type="time"
        value={decimalHoursToTimeString(value)}
        onChange={handleChange}
        className={cn("tabular-nums", className)}
        {...props}
      />
    );
  },
);

TimeInput.displayName = "TimeInput";
