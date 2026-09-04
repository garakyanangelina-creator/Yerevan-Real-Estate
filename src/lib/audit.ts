import "server-only";
import { prisma } from "@/lib/prisma";
import type { Session } from "@/lib/session";

export type AuditAction =
  | "login"
  | "logout"
  | "login.2fa_required"
  | "login.2fa_success"
  | "login.2fa_failed"
  | "listing.create"
  | "listing.update"
  | "listing.delete"
  | "listing.publish"
  | "listing.unpublish"
  | "user.create"
  | "user.update"
  | "user.delete"
  | "user.deactivate"
  | "account.password_change"
  | "account.username_change"
  | "account.2fa_enable"
  | "account.2fa_disable";

export async function writeAuditLog({
  session,
  action,
  target,
  targetId,
  ip,
}: {
  session: Session & { username?: string; role?: string };
  action: AuditAction;
  target?: string;
  targetId?: string;
  ip?: string;
}): Promise<void> {
  try {
    // Look up username if not provided
    let username = session.username ?? "";
    if (!username) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { username: true },
      });
      username = user?.username ?? "unknown";
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        username,
        role: session.role,
        action,
        target: target ?? null,
        targetId: targetId ?? null,
        ip: ip ?? null,
      },
    });
  } catch (err) {
    // Non-fatal — never break a request because of logging
    console.error("[audit] Failed to write audit log:", err);
  }
}

export function getIp(request: Request): string {
  const fwd = (request as Request & { headers: Headers }).headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() ?? "unknown";
}
