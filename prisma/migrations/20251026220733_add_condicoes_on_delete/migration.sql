-- DropForeignKey
ALTER TABLE "public"."carrinho" DROP CONSTRAINT "carrinho_usuario_fk";

-- DropForeignKey
ALTER TABLE "public"."itemCarrinho" DROP CONSTRAINT "itemCarrinho_carrinho_fk";

-- DropForeignKey
ALTER TABLE "public"."itemCarrinho" DROP CONSTRAINT "itemCarrinho_produto_fk";

-- DropForeignKey
ALTER TABLE "public"."itemPedido" DROP CONSTRAINT "itemPedido_pedido_fk";

-- DropForeignKey
ALTER TABLE "public"."modificador" DROP CONSTRAINT "modificador_personalizavel_fk";

-- DropForeignKey
ALTER TABLE "public"."modificadorEmLoja" DROP CONSTRAINT "lojaMod_loja_fk";

-- DropForeignKey
ALTER TABLE "public"."modificadorEmLoja" DROP CONSTRAINT "lojaMod_modificador_fk";

-- DropForeignKey
ALTER TABLE "public"."pedido" DROP CONSTRAINT "pedido_usuario_fk";

-- DropForeignKey
ALTER TABLE "public"."personalizavel" DROP CONSTRAINT "personalizavel_produto_fk";

-- DropForeignKey
ALTER TABLE "public"."produtosEmLoja " DROP CONSTRAINT "lojaProduto_loja_fk";

-- DropForeignKey
ALTER TABLE "public"."produtosEmLoja " DROP CONSTRAINT "lojaProduto_produto_fk";

-- DropForeignKey
ALTER TABLE "public"."relatorioUsuario" DROP CONSTRAINT "relatorio_usuario_fk";

-- DropForeignKey
ALTER TABLE "public"."telefone" DROP CONSTRAINT "telefone_loja_fk";

-- DropForeignKey
ALTER TABLE "public"."telefone" DROP CONSTRAINT "telefone_usuario_fk";

-- AlterTable
ALTER TABLE "public"."pedido" ALTER COLUMN "clienteId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."telefone" ADD CONSTRAINT "telefone_usuario_fk" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."telefone" ADD CONSTRAINT "telefone_loja_fk" FOREIGN KEY ("lojaId") REFERENCES "public"."loja"("idLoja") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relatorioUsuario" ADD CONSTRAINT "relatorio_usuario_fk" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produtosEmLoja " ADD CONSTRAINT "lojaProduto_loja_fk" FOREIGN KEY ("lojaId") REFERENCES "public"."loja"("idLoja") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produtosEmLoja " ADD CONSTRAINT "lojaProduto_produto_fk" FOREIGN KEY ("produtoId") REFERENCES "public"."produto"("idProduto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."personalizavel" ADD CONSTRAINT "personalizavel_produto_fk" FOREIGN KEY ("produtoId") REFERENCES "public"."produto"("idProduto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modificador" ADD CONSTRAINT "modificador_personalizavel_fk" FOREIGN KEY ("personalizavelId") REFERENCES "public"."personalizavel"("idPersonalizavel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modificadorEmLoja" ADD CONSTRAINT "lojaMod_loja_fk" FOREIGN KEY ("lojaId") REFERENCES "public"."loja"("idLoja") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modificadorEmLoja" ADD CONSTRAINT "lojaMod_modificador_fk" FOREIGN KEY ("modificadorId") REFERENCES "public"."modificador"("idModificador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedido" ADD CONSTRAINT "pedido_usuario_fk" FOREIGN KEY ("clienteId") REFERENCES "public"."usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemPedido" ADD CONSTRAINT "itemPedido_pedido_fk" FOREIGN KEY ("pedidoId") REFERENCES "public"."pedido"("idPedido") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carrinho" ADD CONSTRAINT "carrinho_usuario_fk" FOREIGN KEY ("idCarrinho") REFERENCES "public"."usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemCarrinho" ADD CONSTRAINT "itemCarrinho_carrinho_fk" FOREIGN KEY ("carrinhoId") REFERENCES "public"."carrinho"("idCarrinho") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemCarrinho" ADD CONSTRAINT "itemCarrinho_produto_fk" FOREIGN KEY ("produtoId") REFERENCES "public"."produto"("idProduto") ON DELETE CASCADE ON UPDATE CASCADE;
