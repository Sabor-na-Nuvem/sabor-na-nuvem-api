/*
  Warnings:

  - Changed the type of `estado` on the `endereco` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."EstadosBrasil" AS ENUM ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO');

-- AlterTable
ALTER TABLE "public"."endereco" DROP COLUMN "estado",
ADD COLUMN     "estado" "public"."EstadosBrasil" NOT NULL,
ALTER COLUMN "pontoReferencia" DROP NOT NULL;
