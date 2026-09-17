-- AlterTable
ALTER TABLE "Cart" ALTER COLUMN "userId" DROP NOT NULL,
ADD COLUMN "sessionToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_sessionToken_key" ON "Cart"("sessionToken");

-- Un carrito le pertenece a un User o a un invitado (sessionToken), nunca a
-- ambos ni a ninguno — ver src/server/services/cart-service.ts (CartOwner).
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_owner_check"
  CHECK (("userId" IS NOT NULL) != ("sessionToken" IS NOT NULL));
