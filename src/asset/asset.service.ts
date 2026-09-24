import { ForbiddenException, Injectable, NotFoundException, UseGuards } from "@nestjs/common";
import { S3Service } from "@/s3.service";
import CreateAssetDTO from "./dtos/create-asset.dto";
import { PrismaService } from "@/prisma.service";
import { v4 as uuid } from 'uuid'
import { EditAssetDTO } from "./dtos/edit-asset.dto";
import { MoveToAssetDTO } from "./dtos/moveto-asset.dto";
import { CreateATDTO } from "@/asset/dtos/create-assettag.dto";
import { DeleteATDTO } from "./dtos/delete-assettag.dto";
import { EmbeddingService } from "./assetembedding.service";
import { EmbeddingDTO } from "./dtos/embedding.dto";
import { text } from "node:stream/consumers";

@Injectable()
export class AssetService{
    constructor(
        private readonly prisma: PrismaService,
        private readonly embedSrv?: EmbeddingService,
        private readonly s3Srv?: S3Service,

    ){}

    // Moved to Folder Service to avoid circular dependency
    // async moveto(maDTO: MoveToAssetDTO,user:any){}

    async fetchImages(keys,option?){
        let urls 
        console.log("ASSET SRV - Keys:",keys)
        if(option == "folder"){
            urls = await Promise.all(
        
            keys.map(async(key) =>{
                
                let url1 =await this.s3Srv?.generateViewUrl(key[0])
                let url2 =await this.s3Srv?.generateViewUrl(key[1])
                if(!url1){
                    console.log("No key returned for an image url1")
                    url1 =  await this.s3Srv?.generateViewUrl("uploads/2026-07-31-a34c4202-b51e-469c-9a57-b46a322b69b6/notFound.png")
                }
                if(!url2){
                    console.log("No key returned for an image url2")
                    url2 =  await this.s3Srv?.generateViewUrl("uploads/2026-07-31-a34c4202-b51e-469c-9a57-b46a322b69b6/notFound.png")
                }
                    return  [url1,url2]
                })
            )
        }else{
            urls= await Promise.all(
                keys.map(async(key) =>{
                    if(!key){
                        console.log("No key returned for an image")
                        return await this.s3Srv?.generateViewUrl("uploads/2026-07-31-a34c4202-b51e-469c-9a57-b46a322b69b6/notFound.png")
                    }else
                        return await this.s3Srv?.generateViewUrl(key)
                })
            )
        }

        return urls
    }

    async upload(crAssetDto: CreateAssetDTO,ownerId:string,option?:any){
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

        let s3Result
        console.log("ASSET SERVICE -The option is",option)
        if(option?.keyword == 'pphoto'){
            console.log('⭐The Asset uploaded is a personal photo') 
            s3Result = await this.s3Srv!.generateUploadUrl(crAssetDto.assetName, crAssetDto.type, ownerId, undefined, 'pphoto' ); //if it's a personal photo not with all the uploads
        }
        else
            s3Result = await this.s3Srv!.generateUploadUrl(crAssetDto.assetName, crAssetDto.type, assetUuid ) //Example is the full image/png not just image
        const {signedUrl, fileKey} = s3Result
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
                    width:crAssetDto.width,
                    height:crAssetDto.height,
                    // 🚨Make pre-request script to make postman calculate the actual filesize}
                }
            })        
                // 🚨Handle Tags with uploading
                
                //Called mainUrl bec it can be for an image or a video

                    
                return {asset, thumbnailUrl: assObj.thumbnailUrl? assObj.thumbnailUrl : null, mainUrl:signedUrl}
                    
    }

    //🚨 WHat's Left: Try to solve the token issue and try again
    async addEmbedding(embeddingDto:EmbeddingDTO,user?:any){
        console.log("Embedding is starting...")
        const {assetId} = embeddingDto
        let asset = await this.prisma.asset.findUnique({
            where:{ id:assetId}
        })
        const s3Url = await this.s3Srv?.generateViewUrl(asset!.s3Key)
        const vector = await this.embedSrv?.embedImage(s3Url!)
        const result = await this.prisma.$executeRaw`
            UPDATE assets 
            SET embedding=${vector}::vector
            WHERE id=${assetId}
            RETURNING id, "assetName", embedding
        `
        return result
    }

    async searchImage(searchTerm:string,user?:any){
         const queryEmbedding = await this.embedSrv?.processText(searchTerm)
         const isAdmin = user?.role == 'admin' ? true : false

         const assets:any = await this.prisma.$queryRaw`
    SELECT 
        a.id, 
        a."assetName", 
        a."s3Key", 
        a."coverImage", 
        a."mainFolder", 
        a."ownerId",
        1 - (a.embedding <=> ${queryEmbedding}::vector) as similarity,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'folder', jsonb_build_object(
                        'id', f.id,
                        'folderName', f."folderName",
                        'userId', f."userId"
                    )
                )
            ) FILTER (WHERE f.id IS NOT NULL), 
            '[]'::jsonb
        ) as "assetFolder"
    FROM assets as a
    LEFT JOIN "assetfolders" as af ON af."assetId" = a.id
    LEFT JOIN folders as f ON af."folderId" = f.id
    WHERE                 
         1 - (a.embedding <=> ${queryEmbedding}::vector) > 0.235
        AND (
            ${isAdmin} = true -- $3 is a boolean check for isAdmin
            OR a."mainFolder" IS NULL
            OR (f."isActive" IS TRUE AND (f."isPublic" IS TRUE OR f."userId" = ${user?.sub}))
        )
    GROUP BY a.id, a."assetName", a."s3Key", a."coverImage", a."mainFolder", a."ownerId", a.embedding
    ORDER BY similarity DESC
    LIMIT 20;
         `

         console.log(`Results from Search BY Image`,assets)

         return assets
    }

    //⭐⭐ If an asset which is private appeared in the search,
    //Only an admin or the owner of the folder can see it
    async searchText(name:string, user:any){
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
 
        if(user?.role != 'admin'){ // No Filtration if the folder is private or the owner is searching
            query.where.OR = [
                {mainFolder:null},
                {
                    folder:{
                        isActive:true,
                        OR:[
                            {isPublic: true},
                            {userId: user?.sub}
                        ]
                    }
                }
            ]
        }

            assets = await this.prisma.asset.findMany(query)

        return assets
    }

    async hybridSearch(searchItem:string,user?:any){
        const imageRes = await this.searchImage(searchItem,user)
        const textRes = await this.searchText(searchItem,user)
        
        console.log(`Result from image search:` ,imageRes)
        console.log(`Result from text search:` ,textRes)

        //Removing Dups
        const textIds = new Set(textRes.map(ass => ass.id)) // The array of ids
        imageRes.filter( ass => !textIds.has(ass.id))

        const allAssets = [...imageRes,...textRes]
        const viewUrls =  await Promise.all(
            allAssets.map(async(ass) => {  
                return await this.s3Srv?.generateViewUrl(ass.s3Key)
            })
        )

        return {assets:allAssets,viewUrls}

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

    async getAllData(){
        return await this.prisma.asset.findMany({
            where:{isActive:true}
        })
    }

    async getAll(){
        const assets = await this.prisma.asset.findMany({
            where:{isActive:true},
            orderBy: {createdAt: 'asc'}
        })

        const viewUrls = await Promise.all(
            assets.map(async(ass) =>{
                const url = await this.s3Srv?.generateViewUrl(ass.s3Key)
                return url
            })
        )

        if(assets.length > viewUrls.length)
            console.log(`🚨There're assets with no viewUrl`)
        return {assets,viewUrls}
    }

    async getByUser(authorId:string,user?:any){
        let assets:any
        //If the user isn't an admin, add the policy needed to the query [Advanced Query]
        const query:any = {
            where:{ownerId:authorId,isActive:true},
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
 
        if(user?.role != 'admin'){ // No Filtration if the folder is private or the owner is searching
            query.where.OR = [
                {mainFolder:null},
                {
                    folder:{
                        isActive:true,
                        OR:[
                            {isPublic: true},
                            {userId: user?.sub}
                        ]
                    }
                }
            ]
        }

        assets = await this.prisma.asset.findMany(query)

        return assets
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
