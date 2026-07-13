import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UnauthorizedError } from "@/server/errors";
import type { SessionDto } from "@/server/dto/session";

export async function getSession(): Promise<SessionDto> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new UnauthorizedError();
  }

  return session as SessionDto;
}

export async function getSessionOrNull(): Promise<SessionDto | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (session as SessionDto) ?? null;
}
