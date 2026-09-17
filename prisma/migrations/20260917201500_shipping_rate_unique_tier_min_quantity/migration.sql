/*
  Warnings:

  - A unique constraint covering the columns `[tier,minQuantity]` on the table `ShippingRate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ShippingRate_tier_idx";

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRate_tier_minQuantity_key" ON "ShippingRate"("tier", "minQuantity");
