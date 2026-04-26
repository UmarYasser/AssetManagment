import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { PrismaService } from '@/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    providers: [FolderService,PrismaService, JwtService],
    controllers: [FolderController]
})
export class FolderModule {}
