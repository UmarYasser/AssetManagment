import { IsArray, IsNotEmpty, IsUUID } from "class-validator"

export class CreateCollabDTO{
    @IsUUID()
    @IsNotEmpty()
    folderId!:string
    
    @IsNotEmpty()
    @IsArray()
    collabs!:any[]
}