-- DropForeignKey
ALTER TABLE "assettags" DROP CONSTRAINT "assettags_assetId_fkey";

-- DropForeignKey
ALTER TABLE "assettags" DROP CONSTRAINT "assettags_tagId_fkey";

-- AddForeignKey
ALTER TABLE "assettags" ADD CONSTRAINT "assettags_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assettags" ADD CONSTRAINT "assettags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
