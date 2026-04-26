import { IsArray, IsNotEmpty, IsSemVer, IsString } from "class-validator";

export class CreateTagDTO{
    @IsNotEmpty()
    @IsString({each:true})
    tags!:string[];
}