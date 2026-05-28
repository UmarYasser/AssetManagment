import { All, Body, Controller, HttpCode, Post } from "@nestjs/common";
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
    async signup(@Body() body:SignUpDTO){
        //🌟 Will be replaced with the Match Decorator in the future
        return this.authSrv.signup(body)
    }

    @AllowAnonymous()
    @Post('login')
    @HttpCode(200)
    async login(@Body() body:LogInDTO){
        console.log("System Working")
        return this.authSrv.login(body)
    }
}