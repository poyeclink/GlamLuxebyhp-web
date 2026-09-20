-- CreateTable
CREATE TABLE "Translation" (
    "id" UUID NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "targetLocale" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Translation_sourceHash_targetLocale_key" ON "Translation"("sourceHash", "targetLocale");
