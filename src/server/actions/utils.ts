import { ZodError } from "zod";
import { DomainError } from "@/server/errors";

export type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export function handleActionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".");
      fieldErrors[path] = fieldErrors[path] ?? [];
      fieldErrors[path].push(issue.message);
    }
    return { success: false, error: "Datos inválidos", fieldErrors };
  }

  if (error instanceof DomainError) {
    return { success: false, error: error.message };
  }

  console.error(error);
  return { success: false, error: "Ocurrió un error inesperado" };
}
