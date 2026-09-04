-- Publish all existing listings so they appear on the public site.
-- Listings created before auto-publish was added have isPublished=false.
UPDATE "DbProperty"
SET "isPublished" = true,
    "status"      = 'active'
WHERE "isPublished" = false
  AND "status" IN ('available', 'active', '');
