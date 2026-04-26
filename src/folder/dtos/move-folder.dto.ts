import { IsNotEmpty, IsUUID } from "class-validator";

export class MoveFolderDTO{
    @IsUUID()
    @IsNotEmpty()
    chFolder!: string;
    
    @IsUUID()
    @IsNotEmpty()
    prFolder!: string;
}