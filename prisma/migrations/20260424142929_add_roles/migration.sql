-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "ROLE" NOT NULL DEFAULT 'user';
