import { Body, Controller, Post } from "@nestjs/common";
import { AssetTagService } from "./assettag.service";

//🚨 Finish AssetTag Contoller
@Controller('assettag')
export class AssetTagController{
    constructor(
        private readonly atSrv:AssetTagService
    ){}

    @Post('link')
    async link(@Body() body:any){
        return this.atSrv.link(body)
    }
}