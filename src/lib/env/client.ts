import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z
    .string()
    .optional()
    .default("Mi Conducción"),
});

function parseClientEnv() {
  const raw = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  };

  const parsed = clientEnvSchema.safeParse(raw);

  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    // eslint-disable-next-line no-console
    console.error("❌ Error en variables de entorno del cliente:\n" + issues.join("\n"));
    throw new Error("Variables de entorno del cliente inválidas");
  }

  return parsed.data;
}

export const clientEnv = parseClientEnv();
