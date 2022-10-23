-- CreateTable
CREATE TABLE "Language" (
    "id" VARCHAR(36) NOT NULL,
    "iso" VARCHAR(3) NOT NULL,
    "name" VARCHAR(30) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_iso_key" ON "Language"("iso");
