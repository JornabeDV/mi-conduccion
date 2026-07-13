import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthRegisterForm } from "@/components/molecules/auth-register-form";
import { getSessionOrNull } from "@/server/services/session-service";

export default async function RegisterPage() {
  const session = await getSessionOrNull();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Registrate para comenzar a gestionar tu actividad.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empezá gratis</CardTitle>
          <CardDescription>
            Completá tus datos para crear tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthRegisterForm />
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Iniciar sesión
        </Link>
      </p>
    </>
  );
}
