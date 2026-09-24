import { IsAlpha, IsNotEmpty, IsString } from "class-validator";

export class MoveAssetDTO{
    @IsString()
    @IsNotEmpty()
    assetId!: string;
    
    @IsString()
    @IsNotEmpty()
    folderId!:string;
}