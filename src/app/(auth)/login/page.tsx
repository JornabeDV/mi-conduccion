import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthLoginForm } from "@/components/molecules/auth-login-form";
import { getSessionOrNull } from "@/server/services/session-service";

export default async function LoginPage() {
  const session = await getSessionOrNull();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Iniciar sesión
        </h1>
        <p className="text-sm text-muted-foreground">
          Accedé a tu panel de conductor.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenido de vuelta</CardTitle>
          <CardDescription>
            Ingresá tus credenciales para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthLoginForm />
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Crear cuenta
        </Link>
      </p>
    </>
  );
}
