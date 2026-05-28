/*
  Warnings:

  - You are about to drop the column `currentVerId` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `assets` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Made the column `fileSize` on table `assets` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_folderId_fkey";

-- DropIndex
DROP INDEX "assets_currentVerId_key";

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "currentVerId",
DROP COLUMN "userId",
ADD COLUMN     "ownerId" TEXT NOT NULL,
ALTER COLUMN "fileSize" SET NOT NULL;

-- CreateTable
CREATE TABLE "assetfolders" (
    "assetId" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assetfolders_pkey" PRIMARY KEY ("assetId","folderId")
);

-- AddForeignKey
ALTER TABLE "assetfolders" ADD CONSTRAINT "assetfolders_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assetfolders" ADD CONSTRAINT "assetfolders_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
