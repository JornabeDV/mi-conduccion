import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { calendarService } from "@/server/services/calendar-service";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/molecules/button-link";
import { formatCurrency } from "@/shared/helpers/format";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, getDay, startOfMonth, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

const WEEK_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const params = await searchParams;
  const today = new Date();
  const year = params.year ? Number(params.year) : today.getFullYear();
  const month = params.month ? Number(params.month) : today.getMonth() + 1;

  const days = await calendarService.getMonth(session.user.id, year, month);
  const currentDate = new Date(year, month - 1, 1);
  const monthLabel = format(currentDate, "MMMM yyyy", { locale: es });

  const prev = subMonths(currentDate, 1);
  const next = addMonths(currentDate, 1);

  const firstDayOfMonth = getDay(startOfMonth(currentDate));
  const blanks = Array.from({ length: firstDayOfMonth });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Calendario</h1>
          <p className="text-sm text-muted-foreground">Resumen día a día</p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink
            href={`/calendario?year=${prev.getFullYear()}&month=${prev.getMonth() + 1}`}
            variant="outline"
            size="icon-sm"
          >
            <ChevronLeft className="size-4" />
          </ButtonLink>
          <span className="min-w-[140px] text-center text-sm font-medium capitalize">{monthLabel}</span>
          <ButtonLink
            href={`/calendario?year=${next.getFullYear()}&month=${next.getMonth() + 1}`}
            variant="outline"
            size="icon-sm"
          >
            <ChevronRight className="size-4" />
          </ButtonLink>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, index) => (
              <div key={`blank-${index}`} className="aspect-square rounded-lg" />
            ))}
            {days.map((day) => (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "flex aspect-square flex-col justify-between rounded-lg border p-1 text-xs",
                  day.hasEvents ? "bg-muted/40" : "bg-transparent"
                )}
              >
                <span className="font-medium">{format(day.date, "d")}</span>
                {day.hasEvents && (
                  <div className="flex flex-col gap-0.5 text-[10px] leading-tight">
                    {day.income > 0 && <span className="text-green-600">+{formatCurrency(day.income)}</span>}
                    {day.expenses > 0 && <span className="text-red-600">-{formatCurrency(day.expenses)}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
