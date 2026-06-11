import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { FolderService } from "./folder.service";
import { CreateFolderDTO } from "./dtos/create-folder.dto";
import { UpdateFolderDTO } from "./dtos/update-folder.dto";
import { MoveFolderDTO } from "./dtos/move-folder.dto";
import { AuthGuard } from "common/guards/auth.guard";
import { Roles } from "common/decotrators/roles.decorator";
import { DeleteAssetDTO } from "./dtos/delete-asset.dto";
import { MoveAssetDTO } from "./dtos/move-asset.dto";
import { AFCreateDTO } from "@/folder/dtos/afcreate.dto";
import { AFRemoveFromDTO } from "@/folder/dtos/afRemove.dto";
import { CreateCollabDTO } from "@/folder/dtos/create-collab.dto";
import { RemoveUserDTO } from "@/folder/dtos/remove-user.dto";
import { HttpCacheInterceptor } from "common/interceptors/cache.interceptor";
import { Cachable } from "common/decotrators/cache.decorator";

@Roles(['admin'])
@Controller('folder')
export class FolderController{
    constructor(
        private readonly folderSrv: FolderService
    ){}
    //👇 Moving a folder inside another folder, under dispute
    // @UseGuards(AuthGuard)
    // @Patch('moveto')
    // async moveto(@Body() moveFolderDTO: MoveFolderDTO,@Req() req:any){
    //     const user = req.user
    //     return await this.folderSrv.moveto(moveFolderDTO,user)
    // }

    @UseGuards(AuthGuard)
    @Post('movetoFolder')
    async moveToFolder(@Body() maDTO:MoveAssetDTO, @Req() req:any){
        return await this.folderSrv.moveToFolder(maDTO,req.user)
    }

    // 🚨API: MergeFolders
    // ✅API: Add Collaborator
    @UseGuards(AuthGuard)
    @Post('create')
    async create(@Body() createFolderDto: CreateFolderDTO, @Req() req:any){
        const user = req.user
        return await this.folderSrv.create(createFolderDto,user)
    }

    @UseGuards(AuthGuard) 
    @Get('searchFolder')
    async searchFolder(@Query('name') name:string,@Req() req:any){
        return await this.folderSrv.searchFolder(name,req.user)
    }
    
    @Roles(['user'])
    @UseGuards(AuthGuard)
    @Get('getAll')
    async getAll(){
        return await this.folderSrv.getAll()
    }
    
    @UseGuards(AuthGuard)
    @Get('getById/:id')
    async getById(@Param('id') id:string,@Req() req:any){
        return await this.folderSrv.getById(id, req.user)
    }
    
    @UseInterceptors(HttpCacheInterceptor)
    @Cachable('folder')
    @Roles(['user'])
    @UseGuards(AuthGuard)
    @Get('getByFolder/:id')
    async getByFolder(@Param('id') id:string,@Req() req:any){
        return await this.folderSrv.getByFolder(id,req.user)
    }

    //✅ GetByUser: Only the user himself or an admin can view private folders of this user
    @UseGuards(AuthGuard)
    @Get('getByUser/:id')
    async getByUser(@Param('id') id:string,@Req() req:any){
        
        return await this.folderSrv.getByUser(id,req.user)
    }
    
    @UseGuards(AuthGuard)
    @Patch('edit/:id')
    async edit(@Param('id') id:string, @Body() updateFolderDTO: UpdateFolderDTO,@Req() req:any){
        return await this.folderSrv.edit(id,updateFolderDTO,req.user)
    }
    //♫

    @UseGuards(AuthGuard)
    @Delete('deleteFolder/:id')
    async deleteFolder(@Param('id') id:string,@Req() req:any){
        return await this.folderSrv.deleteFolder(id,req.user)
    }

    @UseGuards(AuthGuard)
    @Delete('deleteAsset')
    async deleteAsset(@Body() daDTO:DeleteAssetDTO,@Req() req:any){
        return await this.folderSrv.deleteAsset(daDTO.folderId, daDTO.assetId, req.user)
    }
// ================== Asset Folder Junction Table Methods

    @Post('addto')
    async addToFolder(afCreateDTO:AFCreateDTO, @Req() req:any){
        return this.folderSrv.addToFolder(afCreateDTO,req.user);
    }

    @Get('getAFById/:id') // ?
    async getAFById(@Param('id') id:string, @Req() req:any){
        return this.folderSrv.getById(id,req.user)
    }
    
    // @Delete('removeFrom')
    async removeFrom(afFDTO:AFRemoveFromDTO){
        return this.folderSrv.removeFrom(afFDTO.assetId,afFDTO.folderId)
    }

    // @Delete("purge/:id")
    async hardDelete(@Param('id') id:string){
        return this.folderSrv.purgeAsset(id)
    }

// =================== Collaborator Junction Tbale Methods

    @Post('createCollab')
    async createCollab(@Body() ccDTO:CreateCollabDTO,@Req() req:any){
        return await this.folderSrv.createCollab(ccDTO.collabs,ccDTO.folderId,req.user)
    }

    @Get('getCollabByUserId/:id')
    async getByUserId(@Param('id') id: string, @Req() req:any){
        return await this.folderSrv.getByUserId(req.user)
    }

    @Get('getCollabByFolderId/:id')
    async getByFolderId(@Param('id') id: string, @Req() req:any){
        return await this.folderSrv.getByFolderId(id,req.user)
    }

    @Delete('removeUser')
    async delete(@Body() ruDTO:RemoveUserDTO, @Req() req:any){
        return await this.folderSrv.removeUser(ruDTO,req.user)
    }
}
