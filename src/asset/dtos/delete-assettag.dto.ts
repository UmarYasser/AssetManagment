import { IsNumber, IsUUID } from "class-validator";

export class DeleteATDTO{
    @IsUUID()
    assetId!:string;

    @IsNumber()
    tagId!:number
}