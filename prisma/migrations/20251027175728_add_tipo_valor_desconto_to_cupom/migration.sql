/*
  Warnings:

  - Added the required column `tipoDesconto` to the `cupomDesconto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorDesconto` to the `cupomDesconto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TipoDesconto" AS ENUM ('PERCENTUAL', 'VALOR_FIXO');

-- AlterTable
ALTER TABLE "public"."cupomDesconto" ADD COLUMN     "tipoDesconto" "public"."TipoDesconto" NOT NULL,
ADD COLUMN     "valorDesconto" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "qtdUsos" DROP NOT NULL;
