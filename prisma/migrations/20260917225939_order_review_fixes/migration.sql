/*
  Warnings:

  - You are about to drop the column `notes` on the `Order` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Order_status_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "notes";

-- CreateIndex
CREATE INDEX "Order_status_reservedUntil_idx" ON "Order"("status", "reservedUntil");
