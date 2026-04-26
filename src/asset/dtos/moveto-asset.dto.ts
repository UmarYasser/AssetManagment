import { IsNotEmpty, IsUUID } from "class-validator";

export class MoveToAssetDTO{
    @IsUUID()
    @IsNotEmpty()
    assetId!:string;
    
    @IsUUID()
    @IsNotEmpty()
    folderId!:string;
}