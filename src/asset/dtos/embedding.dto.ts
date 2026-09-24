import { IsNotEmpty, IsString } from "class-validator";

export class EmbeddingDTO{
    @IsString()
    @IsNotEmpty()
    assetId!:string
}