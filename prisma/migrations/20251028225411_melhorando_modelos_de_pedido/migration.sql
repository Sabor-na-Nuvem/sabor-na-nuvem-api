/*
  Warnings:

  - The primary key for the `itemPedido` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `valorTotalProdutos` on the `itemPedido` table. All the data in the column will be lost.
  - Added the required column `valorUnitarioProduto` to the `itemPedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."itemPedido" DROP CONSTRAINT "itemPedido_pkey",
DROP COLUMN "valorTotalProdutos",
ADD COLUMN     "itemPedidoId" SERIAL NOT NULL,
ADD COLUMN     "valorUnitarioProduto" DECIMAL(7,2) NOT NULL,
ADD CONSTRAINT "itemPedido_pkey" PRIMARY KEY ("itemPedidoId");

-- CreateTable
CREATE TABLE "public"."itemPedidoModificadores" (
    "itemPedidoId" INTEGER NOT NULL,
    "modificadorId" INTEGER NOT NULL,
    "valorAdicionalCobrado" DECIMAL(4,2) NOT NULL,

    CONSTRAINT "itemPedidoModificadores_pkey" PRIMARY KEY ("itemPedidoId","modificadorId")
);

-- AddForeignKey
ALTER TABLE "public"."itemPedidoModificadores" ADD CONSTRAINT "itemPedidoModificadores_itemPedidoId_fkey" FOREIGN KEY ("itemPedidoId") REFERENCES "public"."itemPedido"("itemPedidoId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemPedidoModificadores" ADD CONSTRAINT "itemPedidoModificadores_modificadorId_fkey" FOREIGN KEY ("modificadorId") REFERENCES "public"."modificador"("idModificador") ON DELETE RESTRICT ON UPDATE CASCADE;
