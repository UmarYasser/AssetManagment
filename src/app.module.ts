import { Module, RequestMethod } from '@nestjs/common';
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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Pages } from './PagesController';

console.log(join(__dirname, '..', 'Public'))
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'Public'), // Path to your static files
      // exclude: [ '/api/(.*)'], // Exclude API routes from being served as static files
      serveStaticOptions:{
        extensions:['html','css','js'],
        fallthrough:true
      },
      serveRoot: '/', // URL path to access the static files
    }),        
    UsersModule, AuthModule,
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
    }),
  ], 
  controllers: [AppController,Pages], 
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

