/*
  Warnings:

  - You are about to drop the column `folderId` on the `assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "assets" DROP COLUMN "folderId";

--I want to alter the contstraint of asset's mainFolder and make it casecade
ALTER TABLE "assets" DROP CONSTRAINT "assets_mainFolder_fkey";
ALTER TABLE "assets" ADD CONSTRAINT "assets_mainFolder_fkey" FOREIGN KEY ("mainFolder") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;