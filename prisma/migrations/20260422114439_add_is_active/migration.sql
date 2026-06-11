/*
  Warnings:

  - Added the required column `isActive` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isActive` to the `folders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN ;
UPDATE "users" SET "isActive" = true;
ALTER TABLE "users" ALTER COLUMN "isActive" SET NOT NULL;

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "isActive" BOOLEAN ;
UPDATE "assets" SET "isActive" = true;
ALTER TABLE "assets" ALTER COLUMN "isActive" SET NOT NULL;

-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "isActive" BOOLEAN ;
UPDATE "folders" SET "isActive" = true;
ALTER TABLE "folders" ALTER COLUMN "isActive" SET NOT NULL;
