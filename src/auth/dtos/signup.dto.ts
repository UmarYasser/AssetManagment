import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator"


export class SignUpDTO{
    @IsString()
    @IsNotEmpty()
    name!: String 
    
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email!: String
    
    
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password!: String

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    confirmPassword!: String

}