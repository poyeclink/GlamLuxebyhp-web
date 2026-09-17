-- CreateEnum
CREATE TYPE "PricingTier" AS ENUM ('individual', 'mayorista');

-- CreateTable
CREATE TABLE "ShippingRate" (
    "id" UUID NOT NULL,
    "tier" "PricingTier" NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ShippingRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShippingRate_tier_idx" ON "ShippingRate"("tier");
