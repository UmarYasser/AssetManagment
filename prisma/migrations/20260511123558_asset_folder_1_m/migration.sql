/*
  Warnings:

  - Added the required column `mainFolder` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assets" ADD COLUMN "mainFolder" TEXT;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_mainFolder_fkey" FOREIGN KEY ("mainFolder") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
