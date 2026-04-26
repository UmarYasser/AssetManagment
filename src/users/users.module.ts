import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import BcryptProvider from 'src/auth/providers/bcrypt.provider';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
    controllers:[UserController],
    providers:[UserService,PrismaService,ConfigService],
    exports:[UserService]
})
export class UsersModule {}
