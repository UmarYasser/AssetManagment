import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class EditTagDTO{
    @IsNumber()
    @IsNotEmpty()
    id!:number

    @IsString()
    @IsNotEmpty()
    name!:string
}