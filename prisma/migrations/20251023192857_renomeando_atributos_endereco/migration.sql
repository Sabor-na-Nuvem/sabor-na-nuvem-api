/*
  Warnings:

  - You are about to drop the column `casa` on the `endereco` table. All the data in the column will be lost.
  - You are about to drop the column `rua` on the `endereco` table. All the data in the column will be lost.
  - Added the required column `logradouro` to the `endereco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `endereco` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."endereco" DROP COLUMN "casa",
DROP COLUMN "rua",
ADD COLUMN     "logradouro" TEXT NOT NULL,
ADD COLUMN     "numero" VARCHAR(10) NOT NULL;
