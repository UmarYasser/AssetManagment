import { ForbiddenException, Injectable, NotFoundException, UseGuards } from "@nestjs/common";
import { S3Service } from "src/s3.service";
import CreateAssetDTO from "./dtos/create-asset.dto";
import { PrismaService } from "src/prisma.service";
import { v4 as uuid } from 'uuid'
import { AuthGuard } from "common/guards/auth.guard";
import { EditAssetDTO } from "./dtos/edit-asset.dto";
import { NotFound } from "@aws-sdk/client-s3";
import { MoveToAssetDTO } from "./dtos/moveto-asset.dto";

@Injectable()
export class AssetService{
    constructor(
        private readonly s3Srv: S3Service,
        private readonly prisma: PrismaService,
    ){}

    async moveto(maDTO: MoveToAssetDTO,user:any){
        const {assetId, folderId}  = maDTO

        const folder  = await this.prisma.folder.findUnique({
            where: {id: folderId, isActive:true}
        })

        if(!folder)
            throw new NotFoundException("Folder not found")
            
        let asset = await this.prisma.asset.findUnique({
            where:{ id:assetId, isActive:true}
        })
        
        if(!asset)
            throw new NotFoundException("Asset not found")

        if(!(asset.userId == user.id || user.role =='admin'))
            throw new ForbiddenException("You don't have the access to this asset")

        asset = await this.prisma.asset.update({
            where: {id:assetId},
            data:{ folderId:folder.id}
        })
        return asset
    }

    async upload(crAssetDto: CreateAssetDTO,userId:string){
        const {signedUrl, fileKey} = await this.s3Srv.generateUploadUrl(crAssetDto.assetName, crAssetDto.type) //Example is the full image/png not just image

        const verUuid = uuid()
        //🌟To ensure atomicity => Both will be created or both will fail
        const result = await this.prisma.$transaction(async tx =>{
            let asset =  await tx.asset.create({
                data: {
                    assetName: crAssetDto.assetName,
                    type: crAssetDto.type.split('/')[0] == "image" ? "IMAGE" : "VIDEO",
                    folderId: crAssetDto.folderId ?? null,
                    description: crAssetDto.description,
                    userId,
                    // currentVerId: verUuid => Must wait until the version get created
                    // 🚨Make pre-request script to make postman calculate the actual filesize}
                },
                // include:{ currentVersion: true} currentVerId must be a foriegn key for that to work, maybe later
            })
            const version = await tx.version.create({
                data: {
                    id: verUuid,
                    assetId: asset.id,
                    s3Key: fileKey,
                    s3VerId: "ver1",
                    isLatest: true,
                    fileSize: crAssetDto.fileSize 
                    // 🚨Make pre-request script to make postman calculate the actual filesize
                }
            })
            asset = await tx.asset.update({
                where: {id: asset.id},
                data: {currentVerId: verUuid}
            })
            return {asset,version}
             // 🌟 Using transaction due to circular dep. => the asset wants the curVersionId that doesn't exist yet, and the version waits for asset to be created
        })
        // 🚨Handle Tags with uploading

        return {result, signedUrl}
    }

    //?🚨? GetByName?
    async getById(id:string, user:any){
        const asset = await this.prisma.asset.findUnique({
            where: {id, isActive:true},
            include:{
                curVersion: true,
            } // Is this valid prisma syntax to select from the joined version recored?
        })
        if(!asset)
            throw new NotFoundException("Asset not found")
        const viewUrl = await this.s3Srv.generateViewUrl(asset?.curVersion!.s3Key!)
        return {asset, viewUrl}
    } 

    async getByTag(tags: string){ // what is type array in ts? answer:
        const assets = await this.prisma.asset.findMany({
            where:{
                isActive:true,
                assetTag:{
                    some:{
                        tagName: tags
                    }
                }
            },
            include:{
                curVersion:{
                    select:{
                        id:true,
                        s3Key:true
                    }
                },
            }

        })
        if(!assets || assets.length <1)
            throw new NotFoundException("No Assets was found with that tag")

        const result = await Promise.all(
            assets.map(async ast =>({
                ...ast,
                viewUrl: await this.s3Srv.generateViewUrl(ast.curVersion?.s3Key!)
            }))
        )
        return result
    }

    async edit( editAssetDto: EditAssetDTO,id:string){
        const {...upDto} = editAssetDto
        //🌟Check if the folderId is in the reqBody, then it must be in the folder table
        if(upDto.folderId){
            const folder = await this.prisma.folder.findUnique({
                where: {id: upDto.folderId, isActive:true}
            })
            console.log("folder:", folder)
            if(!folder)
                throw new NotFoundException("Folder not found")
        }
        const asset = await this.prisma.asset.update({
            where:{id, isActive:true},
            data: {
                assetName: upDto.assetName,
                description: upDto.description,
                folderId: upDto.folderId,
                // Other attributes like fileSize and type can't be updated from the client
            },
        })
        // If the asset isn't found, what will prisma do? answer: it will throw an error that we can catch and convert to a not found exception
        // Is this the line that we catch? answer: yes, we can catch the error thrown by prisma and check if it's a not found error, then throw a NotFoundException
        if(!asset)
            throw new NotFoundException("Asset not found")

        // ⚠️ The Media file can't be changed under the same asset, only the asset's data can be changed
        // const version = await this.prisma.version.create({
        //     data:{
        //         assetId: asset.id,
        //     }
        // })

        return asset
    }

    // Soft Deletion
    async delete(id:string,user:any){
        let asset = await this.prisma.asset.findUnique({ 
            where: {id, isActive:true}
        })

        if(!asset)
            throw new NotFoundException("Asset not found")

        if(!(asset.userId == user.id || user.role =='admin'))
            throw new ForbiddenException("You are not the owner of this asset")
        asset =await this.prisma.asset.update({
            where: {id},
            data:{isActive:false}
        })
        return asset
    }

    //🚨 Implement HardDelete after a time period (30 days) utilizing S3 DeleteCommand
}


