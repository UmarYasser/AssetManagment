import { IsAlpha, IsNotEmpty, IsUUID } from "class-validator";

export class MoveAssetDTO{
    @IsUUID()
    @IsNotEmpty()
    assetId!: string;
    
    @IsUUID()
    @IsNotEmpty()
    folderId!:string;
}