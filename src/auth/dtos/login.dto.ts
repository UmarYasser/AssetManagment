import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator"


export class LogInDTO{    
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email!: string
    
    
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password!: String

}
