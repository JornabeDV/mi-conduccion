"use client";

import { useTransition, useMemo } from "react";
import { useForm, type Resolver, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createGoal } from "@/server/actions/goal-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormField } from "@/components/molecules/form-field";
import { NumericInput } from "@/components/molecules/numeric-input";
import { formatCurrency } from "@/shared/helpers/format";
import {
  calculateGoalSimulator,
  DEFAULT_GOAL_SIMULATOR_INPUT,
} from "@/shared/helpers/goal-simulator";

const simulatorSchema = z.object({
  netGoal: z.coerce.number().min(0, "La meta debe ser mayor o igual a cero"),
  expenses: z.object({
    fuel: z.coerce.number().min(0),
    service: z.coerce.number().min(0),
    insurance: z.coerce.number().min(0),
    registration: z.coerce.number().min(0),
    other: z.coerce.number().min(0),
  }),
  hourlyIncome: z.coerce.number().min(0),
  incomePerKm: z.coerce.number().min(0),
  daysPerWeek: z.coerce.number().min(1).max(7),
});

type SimulatorFormValues = z.infer<typeof simulatorSchema>;

const expenseFields = [
  { key: "fuel", label: "Nafta" },
  { key: "service", label: "Service" },
  { key: "insurance", label: "Seguro" },
  { key: "registration", label: "Patente" },
  { key: "other", label: "Otros" },
] as const;

export function GoalSimulatorForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    control,
    watch,
  } = useForm<SimulatorFormValues>({
    resolver: zodResolver(simulatorSchema) as Resolver<SimulatorFormValues>,
    defaultValues: DEFAULT_GOAL_SIMULATOR_INPUT,
    mode: "onChange",
  });

  const values = watch();

  const result = useMemo(() => calculateGoalSimulator(values), [values]);

  const handleCreateGoal = () => {
    startTransition(async () => {
      const resultAction = await createGoal({
        period: "MONTHLY",
        targetAmount: result.billingTarget,
        startDate: new Date(),
        endDate: null,
        isActive: true,
      });

      if (resultAction.success) {
        toast.success("Objetivo mensual creado desde el simulador");
        router.push("/objetivos");
      } else {
        toast.error(resultAction.error ?? "No se pudo crear el objetivo");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos del simulador</CardTitle>
            <CardDescription>Cargá tu meta y gastos mensuales estimados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Meta de ganancia neta mensual">
              <Controller
                name="netGoal"
                control={control}
                render={({ field }) => (
                  <NumericInput
                    value={field.value}
                    onChange={field.onChange}
                    decimals={2}
                    min={0}
                    prefix="$ "
                    placeholder="0,00"
                  />
                )}
              />
            </FormField>

            <div className="space-y-2">
              <span className="text-sm font-medium">Gastos mensuales estimados</span>
              <div className="grid gap-4 sm:grid-cols-2">
                {expenseFields.map((expense) => (
                  <FormField key={expense.key} label={expense.label}>
                    <Controller
                      name={`expenses.${expense.key}`}
                      control={control}
                      render={({ field }) => (
                        <NumericInput
                          value={field.value}
                          onChange={field.onChange}
                          decimals={2}
                          min={0}
                          prefix="$ "
                          placeholder="0,00"
                        />
                      )}
                    />
                  </FormField>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <span className="text-sm font-medium">Total gastos</span>
                <span className="text-sm font-bold tabular-nums">
                  {formatCurrency(result.totalExpenses)}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Ingreso por hora estimado">
                <Controller
                  name="hourlyIncome"
                  control={control}
                  render={({ field }) => (
                    <NumericInput
                      value={field.value}
                      onChange={field.onChange}
                      decimals={2}
                      min={0}
                      prefix="$ "
                      placeholder="0,00"
                    />
                  )}
                />
              </FormField>

              <FormField label="Ingreso por km estimado">
                <Controller
                  name="incomePerKm"
                  control={control}
                  render={({ field }) => (
                    <NumericInput
                      value={field.value}
                      onChange={field.onChange}
                      decimals={2}
                      min={0}
                      prefix="$ "
                      placeholder="0,00"
                    />
                  )}
                />
              </FormField>

              <FormField label="Días por semana">
                <Controller
                  name="daysPerWeek"
                  control={control}
                  render={({ field }) => (
                    <NumericInput
                      value={field.value}
                      onChange={field.onChange}
                      decimals={0}
                      min={1}
                      max={7}
                      placeholder="5"
                    />
                  )}
                />
              </FormField>
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={isPending || result.billingTarget <= 0}
              onClick={handleCreateGoal}
            >
              {isPending ? "Guardando..." : "Crear objetivo mensual"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado para tu configuración</CardTitle>
            <CardDescription>
              Con {values.daysPerWeek} días por semana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Facturación mensual necesaria</p>
                <p className="text-xl font-bold tabular-nums">{formatCurrency(result.billingTarget)}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Facturación semanal</p>
                <p className="text-xl font-bold tabular-nums">{formatCurrency(result.weeklyBilling)}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Facturación diaria</p>
                <p className="text-xl font-bold tabular-nums">{formatCurrency(result.dailyBilling)}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Horas diarias aproximadas</p>
                <p className="text-xl font-bold tabular-nums">
                  {result.dailyHours !== null ? `${result.dailyHours} hs` : "—"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Horas mensuales aproximadas</p>
                <p className="text-lg font-semibold tabular-nums">
                  {result.monthlyHours !== null ? `${result.monthlyHours} hs` : "—"}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Horas semanales aproximadas</p>
                <p className="text-lg font-semibold tabular-nums">
                  {result.weeklyHours !== null ? `${result.weeklyHours} hs` : "—"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Km mensuales aproximados</p>
                <p className="text-lg font-semibold tabular-nums">
                  {result.monthlyKm !== null ? `${result.monthlyKm} km` : "—"}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Km semanales aproximados</p>
                <p className="text-lg font-semibold tabular-nums">
                  {result.weeklyKm !== null ? `${result.weeklyKm} km` : "—"}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Km diarios aproximados</p>
                <p className="text-lg font-semibold tabular-nums">
                  {result.dailyKm !== null ? `${result.dailyKm} km` : "—"}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Km por hora aproximados</p>
                <p className="text-lg font-semibold tabular-nums">
                  {result.kmPerHour !== null ? `${result.kmPerHour} km/h` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Escenarios según días por semana</CardTitle>
          <CardDescription>
            Compará cuánto tenés que facturar y trabajar por día según distintas opciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Días por semana</TableHead>
                  <TableHead className="text-right">Objetivo semanal</TableHead>
                  <TableHead className="text-right">Objetivo diario</TableHead>
                  <TableHead className="text-right">Horas diarias</TableHead>
                  <TableHead className="text-right">Km diarios</TableHead>
                  <TableHead className="text-right">Km/hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.scenarios.map((scenario) => (
                  <TableRow key={scenario.daysPerWeek}>
                    <TableCell>{scenario.daysPerWeek}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(scenario.weeklyBilling)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(scenario.dailyBilling)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {scenario.dailyHours} hs
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {scenario.dailyKm} km
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {scenario.kmPerHour} km/h
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
