import { IsArray, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator"

export class CreateATDTO{

    @IsUUID()
    @IsNotEmpty()
    assetId!: string
    
    @IsArray()
    @IsNotEmpty()
    tagIds!: number[]
}