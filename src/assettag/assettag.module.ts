import { Module } from '@nestjs/common';
import { AssetTagController } from './assettag.controller';
import { AssetTagScalarFieldEnum } from 'generated/prisma/internal/prismaNamespace';
import { AssetTagService } from './assettag.service';

@Module({
    controllers:[AssetTagController],
    providers:[AssetTagService]
})
export class AssettagModule {}
