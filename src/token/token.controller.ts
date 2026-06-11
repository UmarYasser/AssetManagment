import { Controller, Param, Patch, Post } from "@nestjs/common";
import { TokenService } from "./token.service";
import { CreateTokenDto } from "./dtos/token.dto";


@Controller('token')
export class TokenController{
    constructor(
        private readonly tokenSrv:TokenService
    ){}

    @Post('refresh/:token')
    async refreshToken(@Param('token') token: any){
        return this.tokenSrv.refreshToken(token)
    }

    // 👇 For Testing❌
    // 🌟Can Be used for an admin dashboard to force logout for a suspious user
    @Patch('invalidate/:token')
    async invalidate(@Param('token') token: any){
        return this.tokenSrv.invalidate(token)  
    }
}