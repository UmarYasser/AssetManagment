import { PrismaService } from "@/prisma.service";
import { Injectable, NotFoundException, Req, UnauthorizedException } from "@nestjs/common";
import { CreateFolderDTO } from "./dtos/create-folder.dto";
import { UpdateFolderDTO } from "./dtos/update-folder.dto";
import { MoveFolderDTO } from "./dtos/move-folder.dto";

@Injectable()
export class FolderService{
    constructor(
        private readonly prisma: PrismaService
    ){}

    async moveto(moveFolderDto: MoveFolderDTO,user:any){
        const {chFolder, prFolder} = moveFolderDto
        const Prfolder = await this.prisma.folder.findUnique({
            where: {id:prFolder, isActive:true}
        })

        if(!Prfolder)
            throw new NotFoundException("Parent folder not found")
        
        let ChFolder = await this.prisma.folder.findUnique({
            where: {id:chFolder, isActive:true}
        })
        if(!ChFolder)
            throw new NotFoundException("Child folder not found")

        if(!(ChFolder!.userId == user.sub || user.role == 'admin'))
            throw new UnauthorizedException("You are not authorized to move this folder")
        
        ChFolder = await this.prisma.folder.update({
            where: {id:chFolder},
            data: {parentId: prFolder}
        })
        return ChFolder
    }

    async create(crFolderDto: CreateFolderDTO,user:any){
        const folder = await this.prisma.folder.create({
            data:{...crFolderDto, userId: user.sub}
        })

        return folder
    }

    async getByFolder(id:string,userId:string){
        const folder = await this.prisma.folder.findUnique({
            where: {id ,isActive:true}
        })

        if(!folder)
            throw new NotFoundException("Folder not found")

        if(folder.isPublic == false)
            if(!(folder.userId == userId || userId == 'admin'))
                throw new UnauthorizedException("You are not authorized to access this folder")

        const assets = await this.prisma.asset.findMany({
            where: {folderId:id, isActive:true}
        })

        if(!await this.prisma.folder.findUnique({
            where: {id, isActive:true}
        }))
            throw new NotFoundException("Folder not found")
        return assets
    }

    async getAll(){
        const folders = await this.prisma.folder.findMany({
            where: {isActive:true}
        })

        return folders
    }

    //🚨Implement that if the folder isPulic = false, to check if the req.user.sub is the same as the userId
    async getById(id:string,user:any){
        const folder = await this.prisma.folder.findUnique({
            where: {id, isActive:true}
        })
        if(!folder)
            throw new NotFoundException("Folder not found")
        
        console.log("user",user)
        if(folder.isPublic == false){
            if(!(folder.userId == user.sub || user.role == 'admin'))
                throw new UnauthorizedException("You are not authorized to access this folder")
        }
        return folder
    }
    
    async edit(id:string,updateFolderDto: UpdateFolderDTO,user:any){

        const folder = await this.prisma.folder.update({
            where:{ id,isActive:true},
            data:{ ...updateFolderDto}
        })
        
        if(!folder)
            throw new NotFoundException("Folder not found")

        if(!(folder.userId == user.sub || user.role == 'admin'))
            throw new UnauthorizedException("You are not authorized to edit this folder")
        return folder
    }

    async delete(id:string,user:any){
        const folder = await this.prisma.folder.findUnique({
            where: {id, isActive:true}  
        })

        if(!folder)
            throw new NotFoundException("Folder not found")

        if(!(folder.userId == user.sub || user.role == 'admin'))
            throw new UnauthorizedException("You are not authorized to delete this folder")
        return folder
    }
}