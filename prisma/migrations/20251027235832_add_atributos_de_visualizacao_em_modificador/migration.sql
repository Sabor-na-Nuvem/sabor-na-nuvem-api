-- AlterTable
ALTER TABLE "public"."modificador" ADD COLUMN     "descricaoModificador" TEXT,
ADD COLUMN     "isOpcaoPadrao" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ordemVisualizacao" INTEGER;
