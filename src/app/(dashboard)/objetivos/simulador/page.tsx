import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { BackLink } from "@/components/molecules/back-link";
import { GoalSimulatorForm } from "@/components/organisms/goal-simulator-form";

export default async function SimuladorObjetivosPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  return (
    <div className="space-y-4">
      <BackLink href="/objetivos" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Simulador de objetivos</h1>
        <p className="text-sm text-muted-foreground">
          Estimá cuánto tenés que facturar y trabajar para llegar a tu meta
        </p>
      </div>

      <GoalSimulatorForm />
    </div>
  );
}
