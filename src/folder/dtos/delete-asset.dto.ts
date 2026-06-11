import { IsNotEmpty, IsUUID } from "class-validator"

export class DeleteAssetDTO{
    @IsUUID()
    @IsNotEmpty()
    assetId!: string
    
    @IsUUID()
    @IsNotEmpty()
    folderId!: string
}