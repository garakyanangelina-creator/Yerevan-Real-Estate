-- CreateTable
CREATE TABLE "SeenProperty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Client" (
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
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "propertyTitle" TEXT NOT NULL,
    "matchCount" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
