-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_mainFolder_fkey";

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_mainFolder_fkey" FOREIGN KEY ("mainFolder") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
