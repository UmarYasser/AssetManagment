/*
  Warnings:

  - Added the required column `userId` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_currentVerId_fkey";

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "currentVerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_currentVerId_fkey" FOREIGN KEY ("currentVerId") REFERENCES "versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
