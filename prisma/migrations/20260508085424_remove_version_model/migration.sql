/*
  Warnings:

  - You are about to drop the `versions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fileSize` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Key` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_currentVerId_fkey";

-- DropForeignKey
ALTER TABLE "versions" DROP CONSTRAINT "versions_assetId_fkey";

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "fileSize" INTEGER ,
ADD COLUMN     "s3Key" TEXT NOT NULL;

-- DropTable
DROP TABLE "versions";
