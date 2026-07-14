import { redirect, notFound } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { workShiftService } from "@/server/services/workshift-service";
import { cashCountService } from "@/server/services/cash-count-service";
import { driverProfileService } from "@/server/services/driver-profile-service";
import { CashCountForm } from "@/components/organisms/cash-count-form";
import { ButtonLink } from "@/components/molecules/button-link";
import { formatCalendarDate } from "@/shared/helpers/format";
import { ArrowLeft } from "lucide-react";

const TYPE_LABELS = {
  OPEN: "Apertura de caja",
  CLOSE: "Cierre de caja",
};

export default async function CashCountDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ shiftId: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const { shiftId } = await params;
  const { type: rawType } = await searchParams;
  const type = rawType === "CLOSE" ? "CLOSE" : "OPEN";

  const shift = await workShiftService.get(shiftId);
  if (!shift || shift.userId !== session.user.id) {
    notFound();
  }

  const summary = await cashCountService.getByShift(session.user.id, shiftId);
  const profile = await driverProfileService.get(session.user.id);
  const count = type === "OPEN" ? summary.open : summary.close;
  const initialData = count
    ? {
        date: count.date,
        denominations: count.denominations as { value: number; quantity: number; label: string }[],
        transferAmount: count.transferAmount ? Number(count.transferAmount) : null,
        appAmount: count.appAmount ? Number(count.appAmount) : null,
        extraAmount: count.extraAmount ? Number(count.extraAmount) : null,
        notes: count.notes,
      }
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ButtonLink href="/administracion-caja" variant="ghost" size="icon-sm">
          <ArrowLeft className="size-4" />
        </ButtonLink>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{TYPE_LABELS[type]}</h1>
          <p className="text-sm text-muted-foreground">
            {shift.vehicle ? `${shift.vehicle.brand} ${shift.vehicle.model}` : "Sin vehículo"} · {formatCalendarDate(shift.date)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <CashCountForm
          shiftId={shiftId}
          type={type}
          shiftDate={shift.date}
          walletProvider={profile?.walletProvider}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
