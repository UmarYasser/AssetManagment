import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import CreateAssetDTO from "./dtos/create-asset.dto";
import { AssetService } from "./asset.service";
import { AuthGuard } from "common/guards/auth.guard";
import { EditAssetDTO } from "./dtos/edit-asset.dto";
import { MoveToAssetDTO } from "./dtos/moveto-asset.dto";



@Controller('asset')
export class AssetController{
    constructor(
        private readonly assetSrv: AssetService
    ){}

    @Patch('moveto')
    async moveto(@Body() maDTO: MoveToAssetDTO,@Req() req:any){
        return await this.assetSrv.moveto(maDTO,req.user)
    }

    
    @Post('upload') //❓ How to handle a file upload
    async upload(@Body() createAssetDto : CreateAssetDTO, @Req() req:any){
        console.log("User:",req.user)
        return this.assetSrv.upload(createAssetDto, req.user.id || req.user)
    }

    @Get('getById/:id')
    async getById(@Param('id') id:string, @Req() req:any){
        return this.assetSrv.getById(id,req.user)
    }

    @Get('getByTag')
    async getByTag(@Query("tags") tags:any){
        console.log(`tags:${tags}`)
        return this.assetSrv.getByTag(tags)
    }

    @Patch('edit/:id') // For metadata and file path since it's just an attribute in
    async edit(@Param('id') id:string,@Body() editAssetDTO: EditAssetDTO){
        return await this.assetSrv.edit(editAssetDTO,id)
    }

    // Soft Deletion
    @Delete('delete/:id')
    async delete(@Param('id') id:string, @Req() req:any){
        return await this.assetSrv.delete(id,req.user)
    }
}