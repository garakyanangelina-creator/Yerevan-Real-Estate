import "server-only";

import { PrismaClient } from "@prisma/client";

// Standard Next.js dev-mode singleton: avoids exhausting connections from
// hot-reload re-evaluating this module on every request.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaReady?: Promise<void>;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Mirrors prisma/migrations/20260626132714_init_crm/migration.sql. Inlined
 * (rather than read from disk at runtime) so it survives serverless bundling
 * regardless of how the platform traces included files — see ensureSchema().
 * If the schema changes, update both this and the migration file together.
 */
const CRM_SCHEMA_STATEMENTS = [
  `CREATE TABLE "SeenProperty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "preferredLanguage" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "preferredDistricts" TEXT NOT NULL,
    "minBudget" REAL,
    "maxBudget" REAL,
    "minArea" REAL,
    "maxArea" REAL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "furnished" TEXT NOT NULL,
    "petsAllowed" BOOLEAN NOT NULL DEFAULT false,
    "parkingRequired" BOOLEAN NOT NULL DEFAULT false,
    "elevatorRequired" BOOLEAN NOT NULL DEFAULT false,
    "balconyRequired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "propertyTitle" TEXT NOT NULL,
    "matchCount" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

/**
 * Serverless platforms (Vercel) ship a read-only filesystem at runtime, so
 * the CRM's SQLite file can't live inside the deployed project directory —
 * DATABASE_URL is expected to point at /tmp in that environment (ephemeral,
 * reset on cold start/redeploy; see README). Since there's no Prisma CLI
 * available at runtime to run migrations, this creates the schema directly
 * the first time anything touches the database in a given lambda instance.
 */
async function ensureSchema(): Promise<void> {
  if (!globalForPrisma.prismaSchemaReady) {
    globalForPrisma.prismaSchemaReady = (async () => {
      for (const statement of CRM_SCHEMA_STATEMENTS) {
        await prisma.$executeRawUnsafe(statement).catch((error) => {
          // Already exists (warm lambda reusing the same /tmp file) — fine to ignore.
          if (!String(error).includes("already exists")) throw error;
        });
      }
    })();
  }
  return globalForPrisma.prismaSchemaReady;
}

export async function ensureCrmDatabase(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    await ensureSchema();
  }
}
