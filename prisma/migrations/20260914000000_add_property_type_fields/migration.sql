-- Add structured fields for house, commercial, and renovation data.
-- All columns use safe defaults so existing rows are unaffected.

ALTER TABLE "DbProperty"
  ADD COLUMN IF NOT EXISTS "landArea"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "renovation"      TEXT,
  ADD COLUMN IF NOT EXISTS "streetLine"      TEXT,
  ADD COLUMN IF NOT EXISTS "storefront"      BOOLEAN,
  ADD COLUMN IF NOT EXISTS "commercialLevel" TEXT;
