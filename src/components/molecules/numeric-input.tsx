"use client";

import { forwardRef } from "react";
import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type FormatNumberOptions } from "@/shared/helpers/number-format";

type NumericInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "ref" | "defaultValue"
> &
  FormatNumberOptions & {
    value?: number | null;
    onChange?: (value: number | null) => void;
    allowNegative?: boolean;
  };

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      value,
      onChange,
      decimals = 0,
      min,
      max,
      prefix,
      suffix,
      allowNegative = false,
      className,
      ...props
    },
    ref,
  ) => {
    const handleValueChange = (values: NumberFormatValues) => {
      const num = values.floatValue;
      if (num === undefined) {
        onChange?.(null);
        return;
      }

      let clamped = num;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);

      onChange?.(clamped);
    };

    return (
      <NumericFormat
        customInput={Input}
        getInputRef={ref}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={decimals}
        allowNegative={allowNegative}
        prefix={prefix}
        suffix={suffix}
        value={value ?? ""}
        onValueChange={handleValueChange}
        isAllowed={(values) => {
          if (values.floatValue === undefined) return true;
          if (!allowNegative && values.floatValue < 0) return false;
          if (min !== undefined && values.floatValue < min) return false;
          if (max !== undefined && values.floatValue > max) return false;
          return true;
        }}
        className={cn("tabular-nums", className)}
        {...props}
      />
    );
  },
);

NumericInput.displayName = "NumericInput";
