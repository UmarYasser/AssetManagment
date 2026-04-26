import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from './token/token.module';
import { AssetModule } from './asset/asset.module';
import { VersionModule } from './version/version.module';
import { FolderModule } from './folder/folder.module';
import { TagModule } from './tag/tag.module';
import { AssettagModule } from './assettag/assettag.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'common/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';


@Module({
  imports: [UsersModule, AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // This makes it available everywhere
      envFilePath: '.env',
    }),
    TokenModule,
    AssetModule,
    VersionModule,
    FolderModule,
    TagModule,
    AssettagModule,
  ],
  controllers: [AppController],
  providers: [AppService,JwtService,PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
})
export class AppModule {}
