-- Add multilingual title/description columns to DbProperty
ALTER TABLE "DbProperty" ADD COLUMN IF NOT EXISTS "titleEn" TEXT;
ALTER TABLE "DbProperty" ADD COLUMN IF NOT EXISTS "titleRu" TEXT;
ALTER TABLE "DbProperty" ADD COLUMN IF NOT EXISTS "titleHy" TEXT;
ALTER TABLE "DbProperty" ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT;
ALTER TABLE "DbProperty" ADD COLUMN IF NOT EXISTS "descriptionRu" TEXT;
ALTER TABLE "DbProperty" ADD COLUMN IF NOT EXISTS "descriptionHy" TEXT;
