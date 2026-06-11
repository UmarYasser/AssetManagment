import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateTokenDto } from './dtos/token.dto';
import { UserService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService{
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtSrv: JwtService,
        private readonly userSrv: UserService,
        private readonly configSrv: ConfigService,
        
    ){}

    // 👇Can be called from login/signup or from refresh token API
    async generateTokens(payload: any){
        const accessT = await this.jwtSrv.signAsync(
            {   //👇❌ Called sub when called from the refreshToken API, and id when called from the auth APIs
                sub: payload.sub,
                email: payload.email,
                role: payload.role
            },{
            expiresIn: this.configSrv.get('JWT_ACCESS_EXPIRATION')/1000 || 1000*60*15,
            secret: this.configSrv.get('JWT_SECRET')
        })

        const refreshT = await this.jwtSrv.signAsync(
            {
                sub: payload.sub 
            },{
            expiresIn: this.configSrv.get('JWT_REFRESH_EXPIRATION')/1000 || 60*60*24*7,
            secret: this.configSrv.get('JWT_SECRET')
        })

        await this.prisma.token.create({
            data:{
                token:refreshT,
                userId: payload.sub,
                expireAt: new Date(Date.now() + ( Number(this.configSrv.get('JWT_REFRESH_EXPIRATION')) || 1000*60*60*24*7))
            }
        })
        return { accessT, refreshT }
    }

    async refreshToken(token: any){
        const verified = await this.verifyToken(token)
        if(verified instanceof UnauthorizedException){
                console.log("🌟Verified token", verified)
                throw new UnauthorizedException(verified.message)
            } 
        const user = await this.userSrv.getOneT(verified.sub,)

        
        if(!user) throw new UnauthorizedException("The user belonging to this token no longer exists")
        const dbToken = await this.prisma.token.update({
            where:{ token:token},
            data: { isVaild: false }
        })
        const tokens = await this.generateTokens({sub:user.id,email:user.email,role:user.role})
        return tokens
    }

    //👇 Only verifies the access token for login    
    async verifyToken(token:any){
        let verified:any
        try{    
            
            verified = await this.jwtSrv.verifyAsync(token,{
                secret: this.configSrv.get('JWT_SECRET')
            })
            console.log(verified)
            const dbToken = await this.prisma.token.findFirst({
                where:{ token:token}
            })
            console.log("🌟DB token", dbToken)
            if(!dbToken?.isVaild)
                throw new UnauthorizedException("Token not valid")                
            
        }catch{
                throw new UnauthorizedException("Token not found or expired")                
        }
        return verified // the payload (id of the refreshToken) 
    }
    
    
    // 👇When the token is used (user logged out) we want to label it as 'invalide'
    async invalidate(token:any){ 
        const verifed = await this.jwtSrv.verifyAsync(token,{
            secret: this.configSrv.get('JWT_SECRET')
        })

        const dbTOken = await this.prisma.token.update({
            where: {token: token,isVaild:true, expireAt: {gt: token.expiresAt}},
            data: {isVaild:false}}
        )
        if(!dbTOken) 
            
            throw new UnauthorizedException("Token not found or already invalidated")

        return dbTOken

    }
} //🌟🌟🌟 Make the token attribute unique so it can be accepted in the update method of the prisma model
