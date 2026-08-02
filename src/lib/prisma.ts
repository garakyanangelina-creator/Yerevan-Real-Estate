import "server-only";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaReady?: Promise<void>;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const SCHEMA_STATEMENTS = [
  // ── CRM ──────────────────────────────────────────────────────────────────
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

  // ── Users ─────────────────────────────────────────────────────────────────
  `CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'employee',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT
  )`,

  // ── Employee Listings ─────────────────────────────────────────────────────
  `CREATE TABLE "DbProperty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'apartment',
    "purpose" TEXT NOT NULL DEFAULT 'sale',
    "district" TEXT NOT NULL DEFAULT 'other',
    "address" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'AMD',
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "bathrooms" INTEGER NOT NULL DEFAULT 0,
    "area" REAL NOT NULL DEFAULT 0,
    "floor" INTEGER NOT NULL DEFAULT 0,
    "totalFloors" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT NOT NULL DEFAULT '[]',
    "amenities" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'available',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
  )`,
];

async function ensureSchema(): Promise<void> {
  if (!globalForPrisma.prismaSchemaReady) {
    globalForPrisma.prismaSchemaReady = (async () => {
      for (const statement of SCHEMA_STATEMENTS) {
        await prisma.$executeRawUnsafe(statement).catch((err) => {
          if (!String(err).includes("already exists")) throw err;
        });
      }
      await seedSuperAdmin();
    })();
  }
  return globalForPrisma.prismaSchemaReady;
}

async function seedSuperAdmin(): Promise<void> {
  try {
    const { hashSync } = await import("bcryptjs");
    const username = process.env.SUPER_ADMIN_USERNAME ?? "superadmin";
    const password = process.env.SUPER_ADMIN_PASSWORD ?? "SuperAdmin@2025";
    const passwordHash = hashSync(password, 12);
    const now = new Date().toISOString();
    // Insert only if no super_admin exists (atomic SQLite INSERT OR IGNORE)
    await prisma.$executeRawUnsafe(
      `INSERT OR IGNORE INTO "User" ("id","username","passwordHash","role","isActive","createdAt","updatedAt")
       SELECT lower(hex(randomblob(16))), ?, ?, 'super_admin', 1, ?, ?
       WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE "role" = 'super_admin')`,
      username,
      passwordHash,
      now,
      now,
    );
  } catch {
    // Non-fatal — super admin may already exist or table not yet available
  }
}

export async function ensureCrmDatabase(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    await ensureSchema();
  }
}

/**
 * Call at the start of any route that needs the full schema (users, listings).
 * In development the schema is created by `prisma db push`; in production it's
 * auto-created here on the first cold-start lambda invocation.
 */
export async function ensureDatabase(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    await ensureSchema();
  }
}
