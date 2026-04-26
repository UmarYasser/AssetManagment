import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { S3Service } from '@/s3.service';
import { AssetService } from './asset.service';
import { PrismaService } from '@/prisma.service';
import { S3Client } from '@aws-sdk/client-s3';
import { JwtService } from '@nestjs/jwt';

@Module({
    controllers: [AssetController],
    providers:[S3Service,AssetService,PrismaService, S3Client,JwtService],
})
export class AssetModule {}
