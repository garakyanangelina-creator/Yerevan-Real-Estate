-- Add listingCode to DbProperty (unique sequential code starting from 501)
ALTER TABLE "DbProperty" ADD COLUMN "listingCode" INTEGER;
CREATE UNIQUE INDEX "DbProperty_listingCode_key" ON "DbProperty"("listingCode");
