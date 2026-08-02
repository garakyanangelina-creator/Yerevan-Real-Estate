import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "./session";
export type { Role, Session } from "./session";
export { SESSION_COOKIE, createSessionToken } from "./session";

/** For use in Route Handlers and Server Components. */
export async function getSession() {
  const store = await cookies();
  return parseSessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function requireSession(allowedRoles?: import("./session").Role[]) {
  const session = await getSession();
  if (!session) return null;
  if (allowedRoles && !allowedRoles.includes(session.role)) return null;
  return session;
}
