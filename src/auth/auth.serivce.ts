import { PrismaService } from "src/prisma.service";
import HashingProvider from "./providers/hashing.provider";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { TokenService } from "src/token/token.service";
import { AllowAnonymous } from "common/decotrators/allowanonymous.decorator";

@Injectable()
export class AuthService{
    constructor(
        private readonly hashingPrv:HashingProvider,
        private readonly prisma:PrismaService,
        private readonly tokenSrv:TokenService,
        private readonly configSrv:ConfigService
    ){}

    async signup(body){
        const hashedPassword = await this.hashingPrv.hash(body.password)
        // 🌟We don't want the confirmPassword here, so we stripe it and use the rest opretor; the cleanest 'mid-level' way
        const {confirmPassword, ...reqBody} = body
        const user = await this.prisma.user.create({
            data: {...reqBody, password: hashedPassword},
            select:{
                id: true, // 👈 Required for generateTokens, but now in the response
                name:true,
                email:true, //👇 If we're in development, show the password, otherwise don't
                password: this.configSrv.get('NODE_ENV') == 'development' ? true : false,
                role:true
            }
        })
        const token = await this.tokenSrv.generateTokens({sub:user.id,email:user.email,role:user.role})
        const { id, ...dataRes} = user
        return {
            ...dataRes,
            ...token
        }
    }

    async login(body){
        const user = await this.prisma.user.findUnique({
            where:{email: body.email}
        })

        if(!user) return {error: 'The email or password are incorrect'}
        
        // 🌟 Will use BcryptProvider or Argon2Provider according to useClass in the AuthModule
        const isMatch = this.hashingPrv.compare(body.password,user.password)
        
        if(!isMatch) return {error: 'The email or password are incorrect'}
        const tokens = await this.tokenSrv.generateTokens({sub:user.id,email:user.email,role:user.role})
        return {
            name:user.name,
            email:user.email,
            role:user.role,
            password: this.configSrv.get("NODE_ENV") == 'development' ? user.password : undefined,
            ...tokens
        }
    }

}