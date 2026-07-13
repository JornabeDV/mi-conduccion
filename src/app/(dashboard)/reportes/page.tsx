"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateReport } from "@/server/actions/report-actions";
import type { ReportType } from "@/server/services/report-service";

const REPORTS = [
  { type: "shifts" as ReportType, title: "Jornadas", description: "Exportá todas tus jornadas con ingresos y detalles.", label: "Descargar jornadas" },
  { type: "expenses" as ReportType, title: "Gastos", description: "Exportá todos los gastos clasificados por categoría.", label: "Descargar gastos" },
  { type: "fuel" as ReportType, title: "Combustible", description: "Exportá todas las cargas de combustible.", label: "Descargar combustible" },
];

export default function ReportesPage() {
  const [isPending, startTransition] = useTransition();

  const download = (type: ReportType) => {
    startTransition(async () => {
      const result = await generateReport(type);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (!result.data) return;

      const blob = new Blob([result.data.content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Descarga iniciada");
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reportes</h1>
        <p className="text-sm text-muted-foreground">Exportá tu información en CSV</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <Card key={report.type}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{report.description}</p>
              <Button onClick={() => download(report.type)} disabled={isPending} className="w-full">
                <FileDown className="mr-2 size-4" />
                {report.label}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        La exportación a PDF y Excel se agregará en una futura mejora.
      </p>
    </div>
  );
}
