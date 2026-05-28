import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateFolderDTO{
    @IsString()
    @IsNotEmpty()
    folderName!:string
    
    @IsString()
    // @IsNotEmpty()
    @IsOptional()
    parentId?:string 

    @IsBoolean()
    // @IsNotEmpty()
    @IsOptional()
    isPublic?: boolean
}