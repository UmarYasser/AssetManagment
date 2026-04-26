-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assettags" (
    "assetId" TEXT NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "assettags_pkey" PRIMARY KEY ("assetId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "assettags_tagId_idx" ON "assettags"("tagId");

-- AddForeignKey
ALTER TABLE "assettags" ADD CONSTRAINT "assettags_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assettags" ADD CONSTRAINT "assettags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

