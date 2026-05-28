import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.serivce';
import BcryptProvider from './providers/bcrypt.provider';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import HashingProvider from './providers/hashing.provider';
import { TokenModule } from 'src/token/token.module';
import { FolderModule } from '@/folder/folder.module';

@Module({
    controllers:[AuthController],
    providers:[AuthService, PrismaService, ConfigService,
        { // 🌟Applying Strategy Pattern with Dependecy Inversion Princple
            provide:HashingProvider,
            useClass:BcryptProvider
        },
    ],
    imports:[TokenModule,FolderModule]
})
export class AuthModule {}
