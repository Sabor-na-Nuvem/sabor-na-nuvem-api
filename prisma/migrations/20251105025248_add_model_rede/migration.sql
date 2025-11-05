/*
  Warnings:

  - You are about to drop the column `carrinhoId` on the `loja` table. All the data in the column will be lost.
  - You are about to drop the column `cnpj` on the `loja` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[redeId,nomeLoja]` on the table `loja` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `redeId` to the `loja` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."loja_cnpj_key";

-- DropIndex
DROP INDEX "public"."loja_nomeLoja_key";

-- AlterTable
ALTER TABLE "public"."loja" DROP COLUMN "carrinhoId",
DROP COLUMN "cnpj",
ADD COLUMN     "cnpjFilial" VARCHAR(14),
ADD COLUMN     "redeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."usuario" ADD COLUMN     "redeId" INTEGER;

-- CreateTable
CREATE TABLE "public"."rede" (
    "idRede" SERIAL NOT NULL,
    "nomeRede" TEXT NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,

    CONSTRAINT "rede_pkey" PRIMARY KEY ("idRede")
);

-- CreateIndex
CREATE UNIQUE INDEX "rede_nomeRede_key" ON "public"."rede"("nomeRede");

-- CreateIndex
CREATE UNIQUE INDEX "rede_cnpj_key" ON "public"."rede"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "loja_redeId_nomeLoja_key" ON "public"."loja"("redeId", "nomeLoja");

-- AddForeignKey
ALTER TABLE "public"."loja" ADD CONSTRAINT "loja_rede_fk" FOREIGN KEY ("redeId") REFERENCES "public"."rede"("idRede") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario" ADD CONSTRAINT "usuario_rede_fk" FOREIGN KEY ("redeId") REFERENCES "public"."rede"("idRede") ON DELETE SET NULL ON UPDATE CASCADE;
