import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import  {PrismaClient}  from '@prisma/client';
import { PrismaClient } from '../generated/prisma/client'; 
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService} from  '@nestjs/config'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
   constructor(
       private readonly configSrv: ConfigService
   ) {
    const connString = configSrv.get<string>('DATABASE_URL');
    // 1. Create a connection pool using your Env variable
    const pool = new Pool({ connectionString: connString });
    
    // 2. Create the Prisma Adapter for Postgres
    const adapter = new PrismaPg(pool);

    // 3. PASS THE ADAPTER TO PRISMA
    // This satisfies the "PrismaClientInitializationError"
    super({ adapter }); 
  }
  // 1. Connect when the module starts
  async onModuleInit() {
    await this.$connect();
  }

  // 2. Clean up when the app shuts down
  async onModuleDestroy() {
    await this.$disconnect();
  }
}