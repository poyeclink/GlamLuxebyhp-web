-- Disponible/Agotado en vez de conteo de stock. Solo agrega columnas: el
-- stock histórico se conserva y las tallas que hoy están en 0 quedan agotadas.
ALTER TABLE "Product" ADD COLUMN "soldOut" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProductVariant" ADD COLUMN "soldOut" BOOLEAN NOT NULL DEFAULT false;
UPDATE "ProductVariant" SET "soldOut" = true WHERE "stock" <= 0;
