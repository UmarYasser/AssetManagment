import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from './token/token.module';
import { AssetModule } from './asset/asset.module';
import { FolderModule } from './folder/folder.module';
import { TagModule } from './tag/tag.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'common/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { PrismaClientExceptionFilter } from 'common/filters/prisma-exceptions.filter';


@Module({
  imports: [UsersModule, AuthModule,
    TokenModule,
    AssetModule,
    FolderModule,
    TagModule,
    ConfigModule.forRoot({
      isGlobal: true, // This makes it available everywhere
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService,JwtService,PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter
    }
  ],
})
export class AppModule {}
