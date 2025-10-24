-- AlterTable
ALTER TABLE "public"."cupomDesconto" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "public"."pedido" ADD CONSTRAINT "pedido_cupom_fk" FOREIGN KEY ("cupomUsadoId") REFERENCES "public"."cupomDesconto"("idCupomDesconto") ON DELETE SET NULL ON UPDATE CASCADE;
