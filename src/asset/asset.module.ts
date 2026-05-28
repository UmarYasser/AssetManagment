import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { S3Service } from '@/s3.service';
import { AssetService } from './asset.service';
import { PrismaService } from '@/prisma.service';
import { S3Client } from '@aws-sdk/client-s3';
import { JwtService } from '@nestjs/jwt';

//🚨🚨 Implement Collages, where 1 asset contins several photos, maybe with a selected template
//✅✅API: SavePin👇
//✅✅✅✅ The relationship between assets and folders are m-m not 1-m
@Module({
    controllers: [AssetController],
    providers:[S3Service,AssetService,PrismaService, S3Client,JwtService],
    exports:[AssetService]
})
export class AssetModule {}
