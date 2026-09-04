import "server-only";

import { PrismaClient } from "@prisma/client";

// Standard Next.js dev-mode singleton to avoid exhausting connections from
// hot-reload re-evaluating this module on every request.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  superAdminSeeded?: Promise<void>;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Ensures the default super admin account exists.
 * Called once per process. Tables are created by `prisma migrate deploy`
 * during the Vercel build — this only handles the seed record.
 */
async function seedSuperAdmin(): Promise<void> {
  if (!globalForPrisma.superAdminSeeded) {
    globalForPrisma.superAdminSeeded = (async () => {
      try {
        const exists = await prisma.user.findFirst({ where: { role: "super_admin" } });
        if (!exists) {
          const { hashSync } = await import("bcryptjs");
          const username = process.env.SUPER_ADMIN_USERNAME;
          const password = process.env.SUPER_ADMIN_PASSWORD;
          if (!username || !password) {
            console.warn("[seed] SUPER_ADMIN_USERNAME or SUPER_ADMIN_PASSWORD not set — skipping super admin seed.");
            return;
          }
          await prisma.user.create({
            data: {
              username,
              passwordHash: hashSync(password, 12),
              role: "super_admin",
            },
          });
          console.log(`[seed] Created super admin: ${username}`);
        }
      } catch (err) {
        // Non-fatal — migrations may not have run yet on a fresh deploy.
        // The next request will retry.
        console.warn("[seed] Could not seed super admin:", String(err));
        globalForPrisma.superAdminSeeded = undefined;
      }
    })();
  }
  return globalForPrisma.superAdminSeeded;
}

/**
 * Call at the start of any authenticated API route.
 * Ensures the super admin seed exists (idempotent, runs once per process).
 */
export async function ensureDatabase(): Promise<void> {
  await seedSuperAdmin();
}

/** Alias kept for backward compat with existing CRM service calls. */
export async function ensureCrmDatabase(): Promise<void> {
  await seedSuperAdmin();
}
