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
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

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
    CacheModule.register({
      isGlobal:true,
      store: redisStore,
      port: 6379,
      host: process.env.REDIS_HOST || 'localhost',
      ttl: 600, // Cache TTL in seconds
    })
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
    },
  ],
  exports:[CacheModule]
})
export class AppModule {}

