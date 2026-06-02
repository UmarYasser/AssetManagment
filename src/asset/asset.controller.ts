import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import CreateAssetDTO from "./dtos/create-asset.dto";
import { AssetService } from "./asset.service";
import { AuthGuard } from "common/guards/auth.guard";
import { EditAssetDTO } from "./dtos/edit-asset.dto";
import { MoveToAssetDTO } from "./dtos/moveto-asset.dto";
import { AllowAnonymous } from "common/decotrators/allowanonymous.decorator";
import { CreateATDTO } from "@/asset/dtos/create-assettag.dto";
import { DeleteATDTO } from "./dtos/delete-assettag.dto";
import { Roles } from "common/decotrators/roles.decorator";
import { ConfigService } from "@nestjs/config";



@Controller('asset')
export class AssetController{
    constructor(
        private readonly assetSrv: AssetService,
        private readonly configSrv:ConfigService
    ){}

    //Moved to Folder Controller 
    // @UseGuards(AuthGuard)
    // @Patch('moveto')
    // async moveto(@Body() maDTO: MoveToAssetDTO,@Req() req:any){
    //     return await this.assetSrv.moveto(maDTO,req.user)
    // }
    //✅ API: SaveAsset 
    //✅ Add covers to asset
    
    @UseGuards(AuthGuard)
    @Roles(['user'])
    @Post('upload') //❓ How to handle a file upload
    async upload(@Body() createAssetDto : CreateAssetDTO, @Req() req:any){
        return this.assetSrv.upload(createAssetDto, req.user.id || req.user.sub)
    }

    @Get('search')
    async search(@Query('name') name:string,@Req() req:any){
        console.log(`User's Role: ${JSON.stringify(req.user)}`)
        return await this.assetSrv.search(name,req.user)
    }

    @UseGuards(AuthGuard)
    @Get('getById/:id')
    async getById(@Param('id') id:string, @Req() req:any){
        return this.assetSrv.getById(id,req.user)
    }

    @UseGuards(AuthGuard)
    @Get('getByTag')
    async getByTag(@Query("tags") tags:any){
        console.log(`tags:${tags}`)
        return this.assetSrv.getByTag(tags)
    }

    @AllowAnonymous()
    // @UseGuards(AuthGuard)
    @Get('getAll')
    async getAll(){
        if(this.configSrv.get('NODE_ENV') =='development')
            return this.assetSrv.getAll()
        else
            return {msg:"Only in development"}
    }

    @Patch('edit/:id') // For metadata and file path since it's just an attribute in
    async edit(@Param('id') id:string,@Body() editAssetDTO: EditAssetDTO, @Req() req:any){
        return await this.assetSrv.edit(editAssetDTO,id,req.user)
    }

    // Soft Deletion
    @Delete('delete/:id')
    async delete(@Param('id') id:string, @Req() req:any){
        return await this.assetSrv.delete(id,req.user)
    }

//================= Tags Junction Table Methods =================
    //🚨See Pintrest if tags can be added/removed after asset creation
    @Post('linkTag')
    async link(@Body() catDTO:CreateATDTO){
        return await this.assetSrv.link(catDTO)
    }   

    @Get('getAllTags')
    async getAllByTags(){
        return this.assetSrv.getAll()
    }

    @Get('getByAsset/:id')
    async getByAsset(@Param('id') id:string){
        return this.assetSrv.getByAsset(id)
    }

    @Delete('unlinkTag')
    async unlink(@Body() datDTO:DeleteATDTO){
        return this.assetSrv.unlink(datDTO)
    }

}
