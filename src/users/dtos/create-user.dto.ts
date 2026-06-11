import {IsEmail, IsEnum, IsNotEmpty,IsObject,IsOptional,IsString} from 'class-validator'

enum UserRole{
    ADMIN = 'admin',
    USER = 'user'
}


export class CreateUserDto{
    @IsString()
    @IsNotEmpty()
    name!: string
    
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email!: string
    
    @IsString()
    @IsNotEmpty()
    password!: string   

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole
}