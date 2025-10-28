/*
  Warnings:

  - You are about to drop the column `valorBase` on the `carrinho` table. All the data in the column will be lost.
  - The primary key for the `itemCarrinho` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `valorTotalProdutos` on the `itemCarrinho` table. All the data in the column will be lost.
  - Added the required column `lojaId` to the `carrinho` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorUnitarioProduto` to the `itemCarrinho` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carrinhoId` to the `loja` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."itemCarrinho" DROP CONSTRAINT "itemCarrinho_produto_fk";

-- AlterTable
ALTER TABLE "public"."carrinho" DROP COLUMN "valorBase",
ADD COLUMN     "lojaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."itemCarrinho" DROP CONSTRAINT "itemCarrinho_pkey",
DROP COLUMN "valorTotalProdutos",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "valorUnitarioProduto" DECIMAL(7,2) NOT NULL,
ALTER COLUMN "qtdProduto" SET DEFAULT 1,
ADD CONSTRAINT "itemCarrinho_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."loja" ADD COLUMN     "carrinhoId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."itemCarrinhoModificadores" (
    "itemCarrinhoId" INTEGER NOT NULL,
    "modificadorId" INTEGER NOT NULL,
    "valorAdicionalCobrado" DECIMAL(4,2) NOT NULL,

    CONSTRAINT "itemCarrinhoModificadores_pkey" PRIMARY KEY ("itemCarrinhoId","modificadorId")
);

-- AddForeignKey
ALTER TABLE "public"."carrinho" ADD CONSTRAINT "carrinho_loja_fk" FOREIGN KEY ("lojaId") REFERENCES "public"."loja"("idLoja") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemCarrinho" ADD CONSTRAINT "itemCarrinho_produto_fk" FOREIGN KEY ("produtoId") REFERENCES "public"."produto"("idProduto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemCarrinhoModificadores" ADD CONSTRAINT "itemCarrinhoModificadores_modificadorId_fkey" FOREIGN KEY ("modificadorId") REFERENCES "public"."modificador"("idModificador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemCarrinhoModificadores" ADD CONSTRAINT "itemCarrinhoModificadores_itemCarrinhoId_fkey" FOREIGN KEY ("itemCarrinhoId") REFERENCES "public"."itemCarrinho"("id") ON DELETE CASCADE ON UPDATE CASCADE;
