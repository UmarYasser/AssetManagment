import { All, Body, Controller, HttpCode, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.serivce";
import { SignUpDTO } from "./dtos/signup.dto";
import { LogInDTO } from "./dtos/login.dto";
import { AllowAnonymous } from "common/decotrators/allowanonymous.decorator";


@Controller('auth')
export class AuthController{
    constructor(
        private readonly authSrv:AuthService
    ){}

    @AllowAnonymous()
    @Post('signup')
    async signup(@Body() body:SignUpDTO,@Res({passthrough: true}) res){
        //🌟 Will be replaced with the Match Decorator in the future
        return this.authSrv.signup(body,res)
    }

    @AllowAnonymous()
    @Post('login')
    @HttpCode(200)
    async login(@Body() body:LogInDTO,@Res({passthrough:true}) res:any){
        return this.authSrv.login(body,res)
    }
}