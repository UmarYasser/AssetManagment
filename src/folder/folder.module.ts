import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { PrismaService } from '@/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AssetModule } from '@/asset/asset.module';

//🚨Manage Folder Collaborator Permissions Options
//🚨🚨🚨API: Create invitations with push notifications
//✅✅ Implement Group Folders, where there're collaborators
@Module({
    providers: [FolderService,PrismaService, JwtService],
    controllers: [FolderController],
    imports:[AssetModule],
    exports:[FolderService]
})
export class FolderModule {}
