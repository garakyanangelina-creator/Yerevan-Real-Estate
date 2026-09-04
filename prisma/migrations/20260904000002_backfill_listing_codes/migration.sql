-- Assign sequential listingCodes to any listings that don't have one yet.
-- Picks up after the current maximum code so there are no collisions.
WITH base AS (
  SELECT COALESCE(MAX("listingCode"), 500) AS max_code
  FROM "DbProperty"
),
unassigned AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
  FROM "DbProperty"
  WHERE "listingCode" IS NULL
)
UPDATE "DbProperty"
SET "listingCode" = (SELECT max_code FROM base) + unassigned.rn
FROM unassigned
WHERE "DbProperty".id = unassigned.id;
