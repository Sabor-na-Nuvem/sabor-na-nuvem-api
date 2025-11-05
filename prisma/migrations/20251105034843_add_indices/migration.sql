/*
  Warnings:

  - The primary key for the `itemCarrinho` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `itemCarrinho` table. All the data in the column will be lost.
  - You are about to drop the `produtosEmLoja ` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."carrinho" DROP CONSTRAINT "carrinho_loja_fk";

-- DropForeignKey
ALTER TABLE "public"."itemCarrinho" DROP CONSTRAINT "itemCarrinho_produto_fk";

-- DropForeignKey
ALTER TABLE "public"."itemCarrinhoModificadores" DROP CONSTRAINT "itemCarrinhoModificadores_itemCarrinhoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."produtosEmLoja " DROP CONSTRAINT "lojaProduto_loja_fk";

-- DropForeignKey
ALTER TABLE "public"."produtosEmLoja " DROP CONSTRAINT "lojaProduto_produto_fk";

-- AlterTable
ALTER TABLE "public"."itemCarrinho" DROP CONSTRAINT "itemCarrinho_pkey",
DROP COLUMN "id",
ADD COLUMN     "idItemCarrinho" SERIAL NOT NULL,
ADD CONSTRAINT "itemCarrinho_pkey" PRIMARY KEY ("idItemCarrinho");

-- AlterTable
ALTER TABLE "public"."usuario" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255);

-- DropTable
DROP TABLE "public"."produtosEmLoja ";

-- CreateTable
CREATE TABLE "public"."produtosEmLoja" (
    "lojaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "disponivel" BOOLEAN NOT NULL,
    "valorBase" DECIMAL(5,2) NOT NULL,
    "emPromocao" BOOLEAN NOT NULL,
    "descontoPromocao" INTEGER,
    "validadePromocao" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtosEmLoja_pkey" PRIMARY KEY ("lojaId","produtoId")
);

-- CreateIndex
CREATE INDEX "produtosEmLoja_produtoId_idx" ON "public"."produtosEmLoja"("produtoId");

-- CreateIndex
CREATE INDEX "authRefreshToken_usuarioId_idx" ON "public"."authRefreshToken"("usuarioId");

-- CreateIndex
CREATE INDEX "authRefreshToken_expiresAt_idx" ON "public"."authRefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "authToken_usuarioId_idx" ON "public"."authToken"("usuarioId");

-- CreateIndex
CREATE INDEX "authToken_expiresAt_idx" ON "public"."authToken"("expiresAt");

-- CreateIndex
CREATE INDEX "authToken_tipo_idx" ON "public"."authToken"("tipo");

-- CreateIndex
CREATE INDEX "carrinho_lojaId_idx" ON "public"."carrinho"("lojaId");

-- CreateIndex
CREATE INDEX "cupomDesconto_usuarioId_idx" ON "public"."cupomDesconto"("usuarioId");

-- CreateIndex
CREATE INDEX "cupomDesconto_codCupom_idx" ON "public"."cupomDesconto"("codCupom");

-- CreateIndex
CREATE INDEX "endereco_cep_idx" ON "public"."endereco"("cep");

-- CreateIndex
CREATE INDEX "itemCarrinho_produtoId_idx" ON "public"."itemCarrinho"("produtoId");

-- CreateIndex
CREATE INDEX "itemCarrinho_carrinhoId_idx" ON "public"."itemCarrinho"("carrinhoId");

-- CreateIndex
CREATE INDEX "itemCarrinhoModificadores_modificadorId_idx" ON "public"."itemCarrinhoModificadores"("modificadorId");

-- CreateIndex
CREATE INDEX "itemPedido_produtoId_idx" ON "public"."itemPedido"("produtoId");

-- CreateIndex
CREATE INDEX "itemPedido_pedidoId_idx" ON "public"."itemPedido"("pedidoId");

-- CreateIndex
CREATE INDEX "itemPedidoModificadores_modificadorId_idx" ON "public"."itemPedidoModificadores"("modificadorId");

-- CreateIndex
CREATE INDEX "modificador_personalizavelId_idx" ON "public"."modificador"("personalizavelId");

-- CreateIndex
CREATE INDEX "modificadorEmLoja_modificadorId_idx" ON "public"."modificadorEmLoja"("modificadorId");

-- CreateIndex
CREATE INDEX "pedido_cupomUsadoId_idx" ON "public"."pedido"("cupomUsadoId");

-- CreateIndex
CREATE INDEX "pedido_clienteId_idx" ON "public"."pedido"("clienteId");

-- CreateIndex
CREATE INDEX "pedido_dataHoraPedido_idx" ON "public"."pedido"("dataHoraPedido");

-- CreateIndex
CREATE INDEX "pedido_lojaId_idx" ON "public"."pedido"("lojaId");

-- CreateIndex
CREATE INDEX "pedido_status_idx" ON "public"."pedido"("status");

-- CreateIndex
CREATE INDEX "pedido_tipoPedido_idx" ON "public"."pedido"("tipoPedido");

-- CreateIndex
CREATE INDEX "personalizavel_produtoId_idx" ON "public"."personalizavel"("produtoId");

-- CreateIndex
CREATE INDEX "produto_categoriaId_idx" ON "public"."produto"("categoriaId");

-- CreateIndex
CREATE INDEX "produto_nomeProduto_idx" ON "public"."produto"("nomeProduto");

-- CreateIndex
CREATE INDEX "telefone_usuarioId_idx" ON "public"."telefone"("usuarioId");

-- CreateIndex
CREATE INDEX "telefone_lojaId_idx" ON "public"."telefone"("lojaId");

-- CreateIndex
CREATE INDEX "usuario_redeId_idx" ON "public"."usuario"("redeId");

-- CreateIndex
CREATE INDEX "usuario_funcionarioLojaId_idx" ON "public"."usuario"("funcionarioLojaId");

-- CreateIndex
CREATE INDEX "usuario_cargo_idx" ON "public"."usuario"("cargo");

-- AddForeignKey
ALTER TABLE "public"."produtosEmLoja" ADD CONSTRAINT "lojaProduto_loja_fk" FOREIGN KEY ("lojaId") REFERENCES "public"."loja"("idLoja") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produtosEmLoja" ADD CONSTRAINT "lojaProduto_produto_fk" FOREIGN KEY ("produtoId") REFERENCES "public"."produto"("idProduto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carrinho" ADD CONSTRAINT "carrinho_loja_fk" FOREIGN KEY ("lojaId") REFERENCES "public"."loja"("idLoja") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemCarrinho" ADD CONSTRAINT "itemCarrinho_produto_fk" FOREIGN KEY ("produtoId") REFERENCES "public"."produto"("idProduto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemCarrinhoModificadores" ADD CONSTRAINT "itemCarrinhoModificadores_itemCarrinhoId_fkey" FOREIGN KEY ("itemCarrinhoId") REFERENCES "public"."itemCarrinho"("idItemCarrinho") ON DELETE CASCADE ON UPDATE CASCADE;
