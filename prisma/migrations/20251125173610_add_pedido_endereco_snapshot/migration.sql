/*
  Warnings:

  - A unique constraint covering the columns `[enderecoEntregaId]` on the table `pedido` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."pedido" ADD COLUMN     "enderecoEntregaId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "pedido_enderecoEntregaId_key" ON "public"."pedido"("enderecoEntregaId");

-- AddForeignKey
ALTER TABLE "public"."pedido" ADD CONSTRAINT "pedido_endereco_fk" FOREIGN KEY ("enderecoEntregaId") REFERENCES "public"."endereco"("idEndereco") ON DELETE RESTRICT ON UPDATE CASCADE;
