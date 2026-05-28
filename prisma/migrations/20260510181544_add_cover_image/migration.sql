/*
  Warnings:

  - Added the required column `coverImage` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "coverImage" TEXT NOT NULL;
