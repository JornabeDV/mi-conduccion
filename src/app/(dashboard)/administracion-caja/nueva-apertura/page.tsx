import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { vehicleRepository } from "@/server/repositories/vehicle-repository";
import { driverProfileService } from "@/server/services/driver-profile-service";
import { OpeningCashCountForm } from "@/components/organisms/opening-cash-count-form";
import { ButtonLink } from "@/components/molecules/button-link";
import { ArrowLeft } from "lucide-react";

export default async function NuevaAperturaPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const vehicles = await vehicleRepository.findByUser(session.user.id);
  const profile = await driverProfileService.get(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <ButtonLink href="/administracion-caja" variant="ghost" size="icon-sm">
          <ArrowLeft className="size-4" />
        </ButtonLink>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nueva apertura</h1>
          <p className="text-sm text-muted-foreground">Cargá con qué dinero salís a trabajar</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        {vehicles.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No hay vehículos registrados. Cargá uno primero.
          </div>
        ) : (
          <OpeningCashCountForm vehicles={vehicles} walletProvider={profile?.walletProvider} />
        )}
      </div>
    </div>
  );
}
