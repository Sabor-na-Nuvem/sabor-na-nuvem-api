-- CreateEnum
CREATE TYPE "public"."StatusPedido" AS ENUM ('CANCELADO', 'AGUARDANDO_PAGAMENTO', 'PENDENTE', 'EM_PREPARO', 'PRONTO_PARA_ENTREGA', 'PRONTO_PARA_RETIRADA', 'EM_ENTREGA', 'REALIZADO');

-- CreateTable
CREATE TABLE "public"."telefone" (
    "idTelefone" SERIAL NOT NULL,
    "ddd" VARCHAR(2) NOT NULL,
    "numero" VARCHAR(9) NOT NULL,
    "usuarioId" INTEGER,
    "lojaId" INTEGER,

    CONSTRAINT "telefone_pkey" PRIMARY KEY ("idTelefone")
);

-- CreateTable
CREATE TABLE "public"."endereco" (
    "idEndereco" SERIAL NOT NULL,
    "cep" VARCHAR(9) NOT NULL,
    "estado" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "casa" VARCHAR(10) NOT NULL,
    "complemento" TEXT,

    CONSTRAINT "endereco_pkey" PRIMARY KEY ("idEndereco")
);

-- CreateTable
CREATE TABLE "public"."loja" (
    "idLoja" SERIAL NOT NULL,
    "nomeLoja" TEXT NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "enderecoId" INTEGER NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "horarioFuncionamento" TEXT NOT NULL,
    "ofereceDelivery" BOOLEAN NOT NULL,
    "raioEntregaKm" DECIMAL(65,30),

    CONSTRAINT "loja_pkey" PRIMARY KEY ("idLoja")
);

-- CreateTable
CREATE TABLE "public"."usuario" (
    "idUsuario" SERIAL NOT NULL,
    "nomeUsuario" VARCHAR(50) NOT NULL,
    "email" VARCHAR(30) NOT NULL,
    "senha" TEXT NOT NULL,
    "isFuncionario" BOOLEAN NOT NULL,
    "isAdmin" BOOLEAN NOT NULL,
    "enderecoId" INTEGER,
    "funcionarioLojaId" INTEGER,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "public"."relatorioUsuario" (
    "usuarioId" INTEGER NOT NULL,
    "gastosTotais" DECIMAL(10,2) NOT NULL,
    "gastosMensais" DECIMAL(10,2) NOT NULL,
    "qtdTotalPedidos" INTEGER NOT NULL,
    "qtdMensalPedidos" INTEGER NOT NULL,

    CONSTRAINT "relatorioUsuario_pkey" PRIMARY KEY ("usuarioId")
);

-- CreateTable
CREATE TABLE "public"."cupomDesconto" (
    "idCupomDesconto" SERIAL NOT NULL,
    "codCupom" TEXT NOT NULL,
    "validade" TIMESTAMP(3) NOT NULL,
    "qtdUsos" INTEGER NOT NULL,
    "usuarioId" INTEGER,

    CONSTRAINT "cupomDesconto_pkey" PRIMARY KEY ("idCupomDesconto")
);

-- CreateTable
CREATE TABLE "public"."categoriaProduto" (
    "idCategoria" SERIAL NOT NULL,
    "nomeCategoria" TEXT NOT NULL,
    "descricaoCategoria" TEXT NOT NULL,

    CONSTRAINT "categoriaProduto_pkey" PRIMARY KEY ("idCategoria")
);

-- CreateTable
CREATE TABLE "public"."produto" (
    "idProduto" SERIAL NOT NULL,
    "imagemUrl" TEXT NOT NULL,
    "nomeProduto" TEXT NOT NULL,
    "descricaoProduto" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("idProduto")
);

-- CreateTable
CREATE TABLE "public"."produtosEmLoja " (
    "lojaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "disponivel" BOOLEAN NOT NULL,
    "valorBase" DECIMAL(5,2) NOT NULL,
    "emPromocao" BOOLEAN NOT NULL,
    "descontoPromocao" INTEGER NOT NULL,
    "validadePromocao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtosEmLoja _pkey" PRIMARY KEY ("lojaId","produtoId")
);

-- CreateTable
CREATE TABLE "public"."personalizavel" (
    "idPersonalizavel" SERIAL NOT NULL,
    "nomePersonalizavel" TEXT NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "selecaoMinima" INTEGER NOT NULL,
    "selecaoMaxima" INTEGER NOT NULL,

    CONSTRAINT "personalizavel_pkey" PRIMARY KEY ("idPersonalizavel")
);

-- CreateTable
CREATE TABLE "public"."modificador" (
    "idModificador" SERIAL NOT NULL,
    "nomeModificador" TEXT NOT NULL,
    "personalizavelId" INTEGER NOT NULL,

    CONSTRAINT "modificador_pkey" PRIMARY KEY ("idModificador")
);

-- CreateTable
CREATE TABLE "public"."modificadorEmLoja" (
    "lojaId" INTEGER NOT NULL,
    "modificadorId" INTEGER NOT NULL,
    "disponivel" BOOLEAN NOT NULL,
    "valorAdicional" DECIMAL(4,2) NOT NULL,

    CONSTRAINT "modificadorEmLoja_pkey" PRIMARY KEY ("lojaId","modificadorId")
);

-- CreateTable
CREATE TABLE "public"."pedido" (
    "idPedido" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "lojaId" INTEGER NOT NULL,
    "dataHoraPedido" TIMESTAMP(3) NOT NULL,
    "valorBase" DECIMAL(7,2) NOT NULL,
    "valorCobrado" DECIMAL(7,2) NOT NULL,
    "cupomUsadoId" INTEGER,
    "observacoesPedido" TEXT,
    "status" "public"."StatusPedido" NOT NULL,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("idPedido")
);

-- CreateTable
CREATE TABLE "public"."itemPedido" (
    "pedidoId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "qtdProduto" INTEGER NOT NULL,
    "valorTotalProdutos" DECIMAL(7,2) NOT NULL,

    CONSTRAINT "itemPedido_pkey" PRIMARY KEY ("pedidoId","produtoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "telefone_ddd_numero_key" ON "public"."telefone"("ddd", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "loja_nomeLoja_key" ON "public"."loja"("nomeLoja");

-- CreateIndex
CREATE UNIQUE INDEX "loja_cnpj_key" ON "public"."loja"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "loja_enderecoId_key" ON "public"."loja"("enderecoId");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "public"."usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_enderecoId_key" ON "public"."usuario"("enderecoId");

-- CreateIndex
CREATE UNIQUE INDEX "cupomDesconto_codCupom_key" ON "public"."cupomDesconto"("codCupom");

-- AddForeignKey
ALTER TABLE "public"."telefone" ADD CONSTRAINT "telefone_usuario_fk" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."telefone" ADD CONSTRAINT "telefone_loja_fk" FOREIGN KEY ("lojaId") REFERENCES "public"."loja"("idLoja") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."loja" ADD CONSTRAINT "loja_endereco_fk" FOREIGN KEY ("enderecoId") REFERENCES "public"."endereco"("idEndereco") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario" ADD CONSTRAINT "usuario_endereco_fk" FOREIGN KEY ("enderecoId") REFERENCES "public"."endereco"("idEndereco") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario" ADD CONSTRAINT "usuario_loja_fk" FOREIGN KEY ("funcionarioLojaId") REFERENCES "public"."loja"("idLoja") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relatorioUsuario" ADD CONSTRAINT "relatorio_usuario_fk" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cupomDesconto" ADD CONSTRAINT "cupom_usuario_fk" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produto" ADD CONSTRAINT "produto_categoria_fk" FOREIGN KEY ("categoriaId") REFERENCES "public"."categoriaProduto"("idCategoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produtosEmLoja " ADD CONSTRAINT "lojaProduto_loja_fk" FOREIGN KEY ("lojaId") REFERENCES "public"."loja"("idLoja") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produtosEmLoja " ADD CONSTRAINT "lojaProduto_produto_fk" FOREIGN KEY ("produtoId") REFERENCES "public"."produto"("idProduto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."personalizavel" ADD CONSTRAINT "personalizavel_produto_fk" FOREIGN KEY ("produtoId") REFERENCES "public"."produto"("idProduto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modificador" ADD CONSTRAINT "modificador_personalizavel_fk" FOREIGN KEY ("personalizavelId") REFERENCES "public"."personalizavel"("idPersonalizavel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modificadorEmLoja" ADD CONSTRAINT "lojaMod_loja_fk" FOREIGN KEY ("lojaId") REFERENCES "public"."loja"("idLoja") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modificadorEmLoja" ADD CONSTRAINT "lojaMod_modificador_fk" FOREIGN KEY ("modificadorId") REFERENCES "public"."modificador"("idModificador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedido" ADD CONSTRAINT "pedido_usuario_fk" FOREIGN KEY ("clienteId") REFERENCES "public"."usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedido" ADD CONSTRAINT "pedido_loja_fk" FOREIGN KEY ("lojaId") REFERENCES "public"."loja"("idLoja") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemPedido" ADD CONSTRAINT "itemPedido_pedido_fk" FOREIGN KEY ("pedidoId") REFERENCES "public"."pedido"("idPedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemPedido" ADD CONSTRAINT "itemPedido_produto_fk" FOREIGN KEY ("produtoId") REFERENCES "public"."produto"("idProduto") ON DELETE RESTRICT ON UPDATE CASCADE;
