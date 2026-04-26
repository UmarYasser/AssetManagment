import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { FolderService } from "./folder.service";
import { CreateFolderDTO } from "./dtos/create-folder.dto";
import { UpdateFolderDTO } from "./dtos/update-folder.dto";
import { MoveFolderDTO } from "./dtos/move-folder.dto";
import { AuthGuard } from "common/guards/auth.guard";
import { Roles } from "common/decotrators/roles.decorator";

@Controller('folder')
export class FolderController{
    constructor(
        private readonly folderSrv: FolderService
    ){}

    @UseGuards(AuthGuard)
    @Patch('moveto')
    async moveto(@Body() moveFolderDTO: MoveFolderDTO,@Req() req:any){
        const user = req.user
        return await this.folderSrv.moveto(moveFolderDTO,user)
    }

    @UseGuards(AuthGuard)
    @Post('create')
    async create(@Body() createFolderDto: CreateFolderDTO, @Req() req:any){
        const user = req.user
        return await this.folderSrv.create(createFolderDto,user)
    }
    
    @UseGuards(AuthGuard)
    @Get('getAll')
    async getAll(){
        return await this.folderSrv.getAll()
    }
    
    @Roles(['user', 'admin'])
    @UseGuards(AuthGuard)
    @Get('getById/:id')
    async getById(@Param('id') id:string,@Req() req:any){
        const user = req.user
        return await this.folderSrv.getById(id, user)
    }
    
    @UseGuards(AuthGuard)
    @Get('getByFolder/:id')
    async getByFolder(@Param('id') id:string,@Req() req:any){
        const userId =req.user.sub
        return await this.folderSrv.getByFolder(id,userId)
    }

    //🚨 GetByUser: If the user access 'My Folders'
    
    @UseGuards(AuthGuard)
    @Patch('edit/:id')
    async edit(@Param('id') id:string, @Body() updateFolderDTO: UpdateFolderDTO,@Req() req:any){
        const user = req.user
        return await this.folderSrv.edit(id,updateFolderDTO,user)
    }
    //♫

    @UseGuards(AuthGuard)
    @Delete('delete/:id')
    async delete(@Param('id') id:string,@Req() req:any){
        const userId =req.user.sub
        return await this.folderSrv.delete(id,userId)
    }
}
