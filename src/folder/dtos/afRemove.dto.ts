import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from "class-validator"


export class AFRemoveFromDTO{
    @IsNotEmpty()
    @IsUUID()
    assetId!:string
    
    @IsNotEmpty()
    @IsUUID()
    folderId!:string

    @IsOptional()
    @IsBoolean()
    isOwner?:Boolean
}