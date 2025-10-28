-- AlterTable
ALTER TABLE "public"."carrinho" ALTER COLUMN "valorBase" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "public"."categoriaProduto" ALTER COLUMN "descricaoCategoria" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."endereco" ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."itemCarrinho" ALTER COLUMN "valorTotalProdutos" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "public"."pedido" ALTER COLUMN "dataHoraPedido" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'PENDENTE';

-- AlterTable
ALTER TABLE "public"."produto" ALTER COLUMN "imagemUrl" DROP NOT NULL,
ALTER COLUMN "descricaoProduto" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."relatorioUsuario" ALTER COLUMN "gastosTotais" SET DEFAULT 0.0,
ALTER COLUMN "gastosMensais" SET DEFAULT 0.0,
ALTER COLUMN "qtdTotalPedidos" SET DEFAULT 0,
ALTER COLUMN "qtdMensalPedidos" SET DEFAULT 0;
