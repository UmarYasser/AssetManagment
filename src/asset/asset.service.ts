import { ForbiddenException, Injectable, NotFoundException, UseGuards } from "@nestjs/common";
import { S3Service } from "@/s3.service";
import CreateAssetDTO from "./dtos/create-asset.dto";
import { PrismaService } from "@/prisma.service";
import { v4 as uuid } from 'uuid'
import { EditAssetDTO } from "./dtos/edit-asset.dto";
import { MoveToAssetDTO } from "./dtos/moveto-asset.dto";
import { CreateATDTO } from "@/asset/dtos/create-assettag.dto";
import { DeleteATDTO } from "./dtos/delete-assettag.dto";

@Injectable()
export class AssetService{
    constructor(
        private readonly prisma: PrismaService,
        private readonly s3Srv?: S3Service,
    ){}

    // Moved to Folder Service to avoid circular dependency
    // async moveto(maDTO: MoveToAssetDTO,user:any){}

    async upload(crAssetDto: CreateAssetDTO,ownerId:string){
        const assetUuid = uuid()
        const assObj ={
            thumbnailUrl: '',
            thumbnailKey:''
        }
        if(crAssetDto.type.split('/')[0] == 'video'){

            const {signedUrl,fileKey} = await this.s3Srv!.generateUploadUrl(crAssetDto.assetName,crAssetDto.type,assetUuid,'cover') //  The cover image will be generated in the frontend and uploaded with the same name but png extension
            assObj.thumbnailUrl = signedUrl
            assObj.thumbnailKey = fileKey
        }
        const {signedUrl, fileKey} = await this.s3Srv!.generateUploadUrl(crAssetDto.assetName, crAssetDto.type, assetUuid) //Example is the full image/png not just image
        let asset = await this.prisma.asset.create({
                data: {
                    id: assetUuid,
                    assetName: crAssetDto.assetName,
                    type: crAssetDto.type.split('/')[0] == "image" ? "IMAGE" : "VIDEO",
                    mainFolder: crAssetDto.mainFolder ?? null,
                    description: crAssetDto.description,
                    ownerId,
                    s3Key:fileKey,
                    fileSize: crAssetDto.fileSize,
                    coverImage: assObj.thumbnailKey? assObj.thumbnailKey : null, // For videos, we will have a cover image, for images this will be null
                    // 🚨Make pre-request script to make postman calculate the actual filesize}
                }
                })        
                // 🚨Handle Tags with uploading
                
                //Called mainUrl bec it can be for an image or a video
        return {asset, thumbnailUrl: assObj.thumbnailUrl? assObj.thumbnailUrl : null, mainUrl:signedUrl}

    }

    //⭐⭐ If an asset which is private appeared in the search,
    //Only an admin or the owner of the folder can see it
    async search(name:string, user:any){
        let assets:any
        //If the user isn't an admin, add the policy needed to the query [Advanced Query]
        const query:any = {
            where:{
                assetName:{
                    contains: name,
                    mode:'insensitive'
                }
            },
            select:{
                id:true,
                assetName:true,
                s3Key:true,
                coverImage:true,
                mainFolder:true,
                ownerId:true,
                assetFolder:{
                    select:{
                        folder:{
                            select:{
                                id:true,
                                folderName:true,
                                userId:true
                            }
                        }
                    }
                }
            }
        }

        if(user.role != 'admin'){ // No Filtration if the folder is private or the owner is searching
            query.where.OR = [
                {mainFolder:null},
                {
                    folder:{
                        isActive:true,
                        OR:[
                            {isPublic: true},
                            {userId: user.sub}
                        ]
                    }
                }
            ]
        }

            assets = await this.prisma.asset.findMany(query)
        
        return assets
    }

    async getById(id:string, user:any){
        let allowPublic:any
        if(user.role =='admin')
            allowPublic= {isPublic:undefined}
        else
            allowPublic= {isPublic:true}

        const asset = await this.prisma.asset.findUnique({
            where: {id, isActive:true,
                OR:[
                    {mainFolder:null},
                    {
                        folder:{
                            isActive:true,
                            OR:[
                                allowPublic,
                                {userId: user.sub}
                            ]
                        }
                    }
                ]
            },
        })
        console.log(asset)

        if(!asset)
            throw new NotFoundException("Asset not found")


        const viewUrl = await this.s3Srv!.generateViewUrl(asset?.s3Key!)
        return {asset, viewUrl}
    }     

    async getAll(){
        return await this.prisma.asset.findMany({
            where:{isActive:true}
        })
    }

    async edit( editAssetDto: EditAssetDTO,id:string,user:any){
        const {...upDto} = editAssetDto
        //🌟Check if the mainFolder is in the reqBody, then it must be in the folder table
        if(upDto.mainFolder ){
            if(user.role != 'admin')
            throw new ForbiddenException("You can't change the main folder from this endpoint, use the moveto endpoint instead")
            else{
                const folder = await this.prisma.folder.findUnique({
                    where: {id: upDto.mainFolder, isActive:true}
                })
                console.log("folder:", folder)
                if(!folder)
                    throw new NotFoundException("Folder not found")
            }
        }
        
        const asset = await this.prisma.asset.update({
            where:{id, isActive:true},
            data: {
                assetName: upDto.assetName,
                description: upDto.description,
                mainFolder: upDto.mainFolder,
                // Other attributes like fileSize and type can't be updated from the client
            },
        })
        console.log(asset)
        // If the asset isn't found, what will prisma do? answer: it will throw an error that we can catch and convert to a not found exception
        // Is this the line that we catch? answer: yes, we can catch the error thrown by prisma and check if it's a not found error, then throw a NotFoundException
        if(!(asset instanceof Object))
            throw new NotFoundException("Asset not found")

        // ⚠️ The Media file can't be changed under the same asset, only the asset's data can be changed
        // const version = await this.prisma.version.create({
        //     data:{
        //         assetId: asset.id,
        //     }
        // })

        return asset
    }
    
    

    // Deletion
    async delete(id:string,user:any,fromFolder?:boolean){
        let asset = await this.prisma.asset.findUnique({ 
            where: {id, isActive:true}
        })
        
        if(!asset)
            throw new NotFoundException("Asset not found")
        let result:any = {}
        //If we're calling the API from the folder methods, we need to check for the collaborators, which are outside this method's scope
        if(!(asset.ownerId == user.sub || user.role =='admin') /*|| !fromFolder*/)
            throw new ForbiddenException("You are not the owner of this asset")
        else{// Delete the asset existance from db and any folders if exist, then from the s3
            result.deleteUrl = await this.s3Srv!.generateDeleteUrl(asset.s3Key!)
            if(asset.coverImage)
                result.coverImageDeleteUrl = await this.s3Srv!.generateDeleteUrl(asset.coverImage)
                asset = await this.prisma.asset.delete({
                    where: {id}
                }) //⭐ Changed after unit testing
                result.asset = asset
        }
        
        //⭐Pintrest Opted for hard deletion
        // asset =await this.prisma.asset.update({
        //     where: {id},
        //     data:{isActive:false}
        // })

        return result
    }

    //🚨 Implement HardDelete after a time period (30 days) utilizing S3 DeleteCommand


    // ====== Tags Shit ======
    async getByTag(tags: any){ // what is type array in ts? answer:
        // const tagsArr = tags.split(',').map(tag => tag.trim())
        const assets = await this.prisma.asset.findMany({
            where:{
                isActive:true,
                assetTag:{
                    some:{
                        tag:{
                            name:{in: tags}
                        }
                    }
                }
            }
        })
        if(!assets || assets.length <1)
            throw new NotFoundException("No Assets was found with that tag")

        const result = await Promise.all(
            assets.map(async ast =>({
                ...ast,
                viewUrl: await this.s3Srv!.generateViewUrl(ast.s3Key!)
            }))
        )
        return result
    }

    async link(catDTO:CreateATDTO){
        const {assetId, tagIds} = catDTO
        const insertData = tagIds.map(id =>{
            return  {
                assetId,
                tagId:id
            }
        })
        console.log(insertData)
        return await this.prisma.assetTag.createManyAndReturn({
            data:insertData
        })
    }
    
    async unlink(datDTO:DeleteATDTO){
        const {assetId, tagId} = datDTO

        return await this.prisma.assetTag.delete({
            where:{
                assetId_tagId: {
                    assetId,
                    tagId
                }
            }
        })
    }

    async getAllTags(){
        return await this.prisma.assetTag.findMany();
    }

    async getByAsset(assetId:string){
        const tags = await this.prisma.assetTag.findMany({
            where:{assetId}
        })

        return tags
    }
}
