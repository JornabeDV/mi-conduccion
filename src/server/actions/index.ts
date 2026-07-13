"use server";

import { getSession } from "@/server/services/session-service";
import { UnauthorizedError } from "@/server/errors";

export async function requireUserId(): Promise<string> {
  const session = await getSession().catch(() => null);
  if (!session) {
    throw new UnauthorizedError();
  }
  return session.user.id;
}
