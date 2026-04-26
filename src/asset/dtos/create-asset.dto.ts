import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";


export default class CreateAssetDTO{
    @IsString()
    @IsNotEmpty()
    assetName!: string;
    
    // @IsEnum(AssetType)
    @IsNotEmpty()
    @Matches(/^(image\/(jpg|jpeg|png)|video\/(mp4|webm|ogg))$/,
        {message: "Type must be an image(png,jpeg,jpg) or a video(mp4,webm,ogg)"}
    )
    type!: string;
    
    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsString()
    @IsOptional()
    folderId?: string;

    @IsNumber()
    @IsNotEmpty()
    fileSize!: number;
}