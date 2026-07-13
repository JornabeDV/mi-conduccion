import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/atoms/logo";
import { getSessionOrNull } from "@/server/services/session-service";

export default async function HomePage() {
  const session = await getSessionOrNull();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-2xl space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Logo href="/" showText={false} imageClassName="h-64 w-64" />
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground sm:text-xl">
              El ERP personal para conductores de plataformas de transporte.
              Llevá el control de tus jornadas, gastos, combustible y objetivos
              en un solo lugar.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className={buttonVariants({
              size: "lg",
              className: "min-w-[10rem]",
            })}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "min-w-[10rem]",
            })}
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
