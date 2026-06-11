import { Module } from "@nestjs/common";
import { TokenService } from "./token.service";
import { TokenController } from "./token.controller";
import { PrismaService } from "src/prisma.service";
import { UsersModule } from "src/users/users.module";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Module({
    providers:[TokenService,PrismaService,ConfigService,JwtService],
    controllers:[TokenController],
    imports:[UsersModule],
    exports:[TokenService]
})
export class TokenModule {}