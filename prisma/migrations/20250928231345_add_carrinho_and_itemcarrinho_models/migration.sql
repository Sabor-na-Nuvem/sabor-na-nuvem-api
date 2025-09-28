/*
  Warnings:

  - You are about to drop the column `latitude` on the `loja` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `loja` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nomeCategoria]` on the table `categoriaProduto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetPasswordToken]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `latitude` to the `endereco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `endereco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pontoReferencia` to the `endereco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paraEntrega` to the `pedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."endereco" ADD COLUMN     "latitude" DECIMAL(9,6) NOT NULL,
ADD COLUMN     "longitude" DECIMAL(9,6) NOT NULL,
ADD COLUMN     "pontoReferencia" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."loja" DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- AlterTable
ALTER TABLE "public"."pedido" ADD COLUMN     "paraEntrega" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "public"."usuario" ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "resetPasswordTokenExpires" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."carrinho" (
    "idCarrinho" INTEGER NOT NULL,
    "paraEntrega" BOOLEAN NOT NULL,
    "valorBase" DECIMAL(7,2) NOT NULL,

    CONSTRAINT "carrinho_pkey" PRIMARY KEY ("idCarrinho")
);

-- CreateTable
CREATE TABLE "public"."itemCarrinho" (
    "carrinhoId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "qtdProduto" INTEGER NOT NULL,
    "valorTotalProdutos" DECIMAL(7,2) NOT NULL,

    CONSTRAINT "itemCarrinho_pkey" PRIMARY KEY ("carrinhoId","produtoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoriaProduto_nomeCategoria_key" ON "public"."categoriaProduto"("nomeCategoria");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_resetPasswordToken_key" ON "public"."usuario"("resetPasswordToken");

-- AddForeignKey
ALTER TABLE "public"."carrinho" ADD CONSTRAINT "carrinho_usuario_fk" FOREIGN KEY ("idCarrinho") REFERENCES "public"."usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemCarrinho" ADD CONSTRAINT "itemCarrinho_carrinho_fk" FOREIGN KEY ("carrinhoId") REFERENCES "public"."carrinho"("idCarrinho") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemCarrinho" ADD CONSTRAINT "itemCarrinho_produto_fk" FOREIGN KEY ("produtoId") REFERENCES "public"."produto"("idProduto") ON DELETE RESTRICT ON UPDATE CASCADE;
