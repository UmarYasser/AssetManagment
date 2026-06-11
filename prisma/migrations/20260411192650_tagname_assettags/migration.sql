/*
  Warnings:

  - Added the required column `tagName` to the `assettags` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assettags" ADD COLUMN     "tagName" TEXT NOT NULL;
