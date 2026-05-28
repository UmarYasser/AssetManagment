import { IsNotEmpty, IsUUID } from "class-validator"

export class RemoveUserDTO{
    @IsUUID()
    @IsNotEmpty()
    userId!:string
 
    @IsUUID()
    @IsNotEmpty()
    folderId!:string
}