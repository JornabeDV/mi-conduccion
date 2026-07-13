import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z
    .string()
    .optional()
    .default("Mi Conducción"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerida"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET debe tener al menos 32 caracteres"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL debe ser una URL válida"),
});

function parseServerEnv() {
  const raw = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  };

  const parsed = serverEnvSchema.safeParse(raw);

  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    // eslint-disable-next-line no-console
    console.error("❌ Error en variables de entorno del servidor:\n" + issues.join("\n"));
    throw new Error("Variables de entorno del servidor inválidas");
  }

  return parsed.data;
}

export const serverEnv = parseServerEnv();
