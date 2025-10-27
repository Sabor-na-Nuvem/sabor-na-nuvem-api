-- AlterTable
ALTER TABLE "public"."relatorioUsuario" ADD COLUMN     "dataUltimoPedido" TIMESTAMP(3),
ADD COLUMN     "gastoDesdeUltimoCupom" DECIMAL(10,2) NOT NULL DEFAULT 0.0;
