import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { driverProfileService } from "@/server/services/driver-profile-service";
import { DriverProfileForm } from "@/components/organisms/driver-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PerfilPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");

  const profile = await driverProfileService.get(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Perfil</h1>
        <p className="text-sm text-muted-foreground">Tus datos personales y de cobro</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billetera digital</CardTitle>
        </CardHeader>
        <CardContent>
          <DriverProfileForm
            initialData={{
              walletProvider: profile?.walletProvider ?? null,
              walletIdentifier: profile?.walletIdentifier ?? null,
              walletAccountOwner: profile?.walletAccountOwner ?? null,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
