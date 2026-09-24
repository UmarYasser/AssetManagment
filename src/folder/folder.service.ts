import { PrismaService } from "@/prisma.service";
import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, Req, UnauthorizedException } from "@nestjs/common";
import { CreateFolderDTO } from "./dtos/create-folder.dto";
import { UpdateFolderDTO } from "./dtos/update-folder.dto";
import { MoveFolderDTO } from "./dtos/move-folder.dto";
import { AssetService } from "@/asset/asset.service";
import { MoveAssetDTO } from "./dtos/move-asset.dto";
import { ConfigService } from "@nestjs/config";
import { RemoveUserDTO } from "@/folder/dtos/remove-user.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";


//
@Injectable()
export class FolderService{
    constructor(
        private readonly prisma: PrismaService,
        private readonly assetSrv: AssetService,
        private readonly configSrv: ConfigService,
         @Inject(CACHE_MANAGER) private cacheMng:Cache
    ){}

    // Remove the idea of folder inside folder like PC file explorer
    //Only a folder can have assets
    // async moveto(moveFolderDto: MoveFolderDTO,user:any){
    //     const {chFolder, prFolder} = moveFolderDto
    //     const Prfolder = await this.prisma.folder.findUnique({
    //         where: {id:prFolder, isActive:true}
    //     })

    //     if(!Prfolder)
    //         throw new NotFoundException("Parent folder not found")
        
    //     let ChFolder = await this.prisma.folder.findUnique({
    //         where: {id:chFolder, isActive:true}
    //     })
    //     if(!ChFolder)
    //         throw new NotFoundException("Child folder not found")

    //     if(!(ChFolder!.userId == user.sub || user.role == 'admin'))
    //         throw new UnauthorizedException("You are not authorized to move this folder")
        
    //     ChFolder = await this.prisma.folder.update({
    //         where: {id:chFolder},
    //         data: {parentId: prFolder}
    //     })
    //     return ChFolder
    // }

    async moveToFolder(maDto: MoveAssetDTO,user:any,isOwner?:boolean){
        //Can be optimized
        //✅Current: Remove all the calls of the callborations API from this file 
        // and replace it with the joins in the folder.findUnqiue
        const {assetId, folderId}  = maDto

        const folder  = await this.prisma.folder.findUnique({
            where: {
                id: folderId,
                isActive:true,
            },
            include:{
                collaborator: { where: {userId:user.sub} }
            }
        })

        if(!folder)
            throw new NotFoundException("Folder not found")
            
        //🚨Make an include clasue instead
        let asset = await this.prisma.asset.findUnique({
            where:{ id:assetId, isActive:true}
        })

        if(!asset)
            throw new NotFoundException("Asset not found")
        

        // Either the owner, an admin or a collaborator only
        let haveAccess = (folder.userId == user.sub || user.role =='admin' /*|| collabsIDs.includes(user.sub)*/)
        let devMsg:string|undefined = `User ${user.sub} is trying to move an asset to folder with owner id ${folder.userId}`
        if(!haveAccess){
            if(this.configSrv.get('NODE_ENV') == 'production') 
                devMsg = undefined
            throw new ForbiddenException(`You don't have the access to this asset \n${devMsg}`)
        }

        let isowner = asset.ownerId == user.sub
        console.log(`Is the user the owner? ${isowner}`)
        console.log(`Does the user have access to move the asset? ${haveAccess}`)
        if(!asset?.mainFolder){
            asset = await this.prisma.asset.update({
                where: {id:assetId},
                data:{ mainFolder: folderId}
            })
        }
        const af = await this.addToFolder(asset,folder,isowner)

        const cacheKey = `folder:getByFolder:${folderId}`
        await (this.cacheMng as any).del(cacheKey)
        return af
    }

    async create(crFolderDto: CreateFolderDTO,user:any){
        const folder = await this.prisma.folder.create({
            data:{...crFolderDto, userId: user.sub}
        })
        const allfolders = await this.prisma.folder.findMany({
            where:{isActive:true, userId:user.sub},
            include:{
                assetFolder:{
                    include:{
                        asset:{
                            select:{
                                assetName:true,
                                s3Key:true
                            }
                        }
                    }
                }
            }
        })

        return {folder,allfolders}
    }

    async searchFolder(name:string,user:any){
        let folders:any
            folders = await this.prisma.folder.findMany({
                where:{
                    folderName:{
                        contains: name,
                        mode:'insensitive'
                    }, 
                    isPublic: user.role == 'admin' ? undefined : true
                }
                // If the admin is searching, return any, otherwise, only public folders
            }) 
        //Case: User B got User A's private folder

        return folders
    }

    async getByFolder(id:string,user:any){
        const folder = await this.prisma.folder.findUnique({
            where: {id ,isActive:true},
            include:{
                assetFolder:{
                    include:{
                        asset:true
                    }
                }
            }
            
        })
        if(!folder)
            throw new NotFoundException("Folder not found")

        if(folder.isPublic == false)
            if(!(folder.userId == user.sub || user.role == 'admin'))
                throw new UnauthorizedException("You are not authorized to access this folder")


        // const assets = await this.getAssetByFolder(id, user.sub)
        const assets = folder.assetFolder

        return assets
    }

    async getAll(){
        const folders = await this.prisma.folder.findMany({
            where: {isActive:true}
        })

        return folders
    }

    async getByUser(userId:string,user:any){
        let letPrivate = (user.role == 'admin' || user.sub == userId) 
        console.log(`Is private folders allowed? ${letPrivate ? true : false}`)
        

        const folders = await this.prisma.$queryRaw`
            SELECT DISTINCT ON  (a.id) f.id as "id", f."folderName", a."s3Key", a."assetName"
            FROM folders as f
            LEFT JOIN assetfolders as af ON af."folderId" = f.id
            LEFT JOIN assets as a ON af."assetId" = a.id

            WHERE f."isActive" = true AND (
                f."userId" = ${userId}
                OR EXISTS(
                    SELECT 1 from collaborators as cb
                    WHERE cb."folderId" = 	f.id
                    AND cb."userId" = ${userId}
                )
            ) AND (${letPrivate}::boolean = true OR f."isPublic" = true)

            LIMIT 1
        `
        console.log(`Folders:`, folders)
        const coverImage = ''
        console.log(`Folders found for user ${userId} By ${user.sub}: ${folders}`)
        return {folders,coverImage}
    }

    //✅Implement that if the folder isPulic = false, to check if the req.user.sub is the same as the userId
    async getById(id:string,user:any){
        
        let folder:any
        if(user.role == 'admin'){// Admins have full access
            folder = await this.prisma.folder.findUnique({
                where: {id, isActive:true}
            })

        }else{
            folder = await this.prisma.folder.findUnique({
                where:{ id,  isActive:true,
                    OR:[// If not an admin
                       { userId:user.sub}, // 1.Either he's the owner
                       {isPublic:true}, // 2, Or it's a public folder
                       {collaborator: {some: {userId:user.sub}}} // 3. Or he's a collaborator of the folder
                    ]
                }
            })
        }

        if(!folder)
            throw new NotFoundException("Folder not found")
        
        return folder
    }
    
    async edit(id:string,updateFolderDto: UpdateFolderDTO,user:any){
        let folder:any
        if(user.role == 'admin'){
            folder = await this.prisma.folder.update({
                where:{ id,isActive:true}, 
                data:{ ...updateFolderDto}
            })
        }else{
            folder = await this.prisma.folder.update({
                where:{id, isActive:true,
                    OR:[
                        {userId:user.sub},
                        {collaborator: {some: {userId:user.sub}}}
                    ]
                },
                data:{ ...updateFolderDto}
                
            })
        }
        console.log(folder)
        
        if(!(folder instanceof Object))
            throw new NotFoundException("Folder not found")
        
        return folder
    }

    async deleteFolder(id:string,user:any){
        let  folder = await this.prisma.folder.findUnique({
            where: {id, isActive:true}  
        })

        if(!folder)
            throw new NotFoundException("Folder not found")

        // Collaborators Shouldn't be able to delete the folder, only an admin or the owner
        // const collabs = await this.collabSrv.getByFolderId(id,user)
        // const collabsIDs = collabs.map((c) => c.userId)

        const haveAccess = !(folder.userId == user.sub || user.role == 'admin' )
        if(haveAccess)
            throw new UnauthorizedException("You are not authorized to delete this folder")
        

        folder = await this.prisma.folder.update({
            where:{id},
            data:{isActive:false}
        })
        return folder
    }


    //🚨Add the ability to undo 
    //⭐⭐
    async deleteAsset(folderId:string,assetId:string,user:any){
        let folder:any
        if(user.role == 'admin'){
            folder = await this.prisma.folder.findUnique({
                where:{id:folderId, isActive:true},
                include:{
                    // collaborator: { where: {userId:user.sub} },
                    assetFolder:{
                        where: {assetId},
                        include:{
                            asset:{
                                select:{
                                    id:true,
                                    assetName:true,
                                    ownerId:true,
                                    isActive:true,
                                    mainFolder:true
                                }
                            },
                        } 
                        // ⭐Use include again to see the asset in the same db roundtrip
                    }
                } 
            })
        }else{
            folder = await this.prisma.folder.findUnique({
                where:{ id:folderId, isActive:true,
                    OR:[
                        {userId:user.sub },
                        {collaborator: {some: {userId:user.sub}}}
                    ]
                },
                include:{
                    assetFolder:{ // Joins the Junction table
                        where:{assetId},
                        include:{ // Joins the asset found that has a relation with this folder
                            asset:{
                                select:{
                                    id:true,
                                    assetName:true,
                                    ownerId:true,
                                    isActive:true,
                                    mainFolder:true
                                }
                            }
                        }
                    },
                    collaborator: { 
                        where: {userId:user.sub},
                        include:{
                            user:{
                                select:{
                                    name:true,
                                    email:true
                                }
                            }
                        } 
                    },
                }
            })
        }
        console.log(`Folder found for deleting asset: ${JSON.stringify(folder)}`)
        if(!folder)
            throw new NotFoundException("Folder not found")
        
        const asset = folder?.assetFolder[0]?.asset
        
        if(!asset)
            throw new NotFoundException("Asset not found")
        

        //3 cases: 
        //1. The Owner deletes it from the mainFolder
        //2. The Owner delete it from another folder
        //3. A non-owner user deletes it from his folder
        const owner = folder.assetFolder[0]?.isOwner //|| folder.collaborator.map(c => c.userId).includes(user.sub)
        console.log(folder.assetFolder)
        console.log(`Is the user the owner or a collaborator? ${owner}`)
        let msg:string, delResult:any = {}
        if(owner){
            if(asset.mainFolder == folder.id){
                delResult = await this.assetSrv.delete(asset.id,user,true)
                msg ="All Occurences of the asset have been deleted along with the DB & S3"
            }else{
                delResult = await this.removeFrom(asset.id,folder.id)
                msg = "The Asset has been removed from this folder"
            }
        }else{
            delResult = await this.removeFrom(asset.id,folder.id)
            msg = "The Asset has been removed from this folder"
        }

        return {msg,delResult}

    }

// ================ Asset Folder Junction Table Methods

    async addToFolder(asset:any,folder:any,isowner?:boolean){
        try{
            const af = await this.prisma.assetFolder.create({
                data:{
                    assetId:asset.id,
                    folderId:folder.id,
                    isOwner: isowner
                }
            }) 
            return af
        }catch(err:any){
            console.log(err.meta.driverAdapterError.cause.kind)
            if(err.code == 'P2002'){ //Unique Constraint Violation
                console.log("Conflict Error")
                throw new ConflictException("Asset already belongs to this folder")
            }
        }
    }

    async removeFrom(assetId:string,folderId:string){
        const af = await this.prisma.assetFolder.delete({
            where:{
                //⭐ The Composite Key field must called like this:
                assetId_folderId:{ 
                    assetId:assetId,
                    folderId:folderId
                }
            }
        })
        const cacheKey = `folder:getByFolder:${folderId}`
        await (this.cacheMng as any).del(cacheKey)
        return af
    }

    // Not used due to using the transaction in the asset serivce, which requires using assetFolder.deleteMany directly
    async purgeAsset(assetId:string){
        const af = await this.prisma.assetFolder.deleteMany({
            where:{ assetId }
        })
        return af
    }

    async getAssetByFolder(folderId:string,user){
        const af = await this.prisma.assetFolder.findMany({
            where:{ folderId,},
            include:{ asset:true }
        })
        return af
    }

// ============= Collaborator Junction Table Methods

    async createCollab(collabs:any[],folderId:string,user:any){
        // if(collabs.length == 0) return {message:"No collaborators to add"}
        // Check If folder exisits
        // Check if user exisits & if the owner isn't in the collabs ID
        const insertData = collabs.map((cID)=>{
            return {
                folderId,
                userId: cID
            }
        })
        try{
            const collab = await this.prisma.collaborator.createManyAndReturn({
                data:insertData,
                select:{
                    userId:true,
                    createdAt:true,
                    folderId:true
                }
            })
            return collab
        }catch(err:any){
            if(err.code == 'P2002'){ //Unique Constraint Violation
                console.log("Conflict Error")
                throw new ConflictException("One or more of the collaborators already belongs to this folder")
            }
        }

    }

    // async getAll(){
    //     return await this.prisma.collaborator.findMany()
    // }

    async getByUserId(user:any){
        // if() Add Permission to see the user's collaboration?
        const collabs = await this.prisma.collaborator.findMany({
            where:{userId:user},
            select:{
                folder:{
                    select:{
                        id:true,
                        folderName:true
                    }
                }
            }
        })
        return { userId:user.sub,userEmail:user.email,collabs}
    }

    async getByFolderId(id:string,user:any){
        return await this.prisma.collaborator.findMany({
            where:{folderId:id},
            select:{
                userId:true,
                folderId:true,
                folder:{
                    select:{
                        folderName:true
                    }
                },
                user:{
                    select:{
                        name:true,
                        email:true
                    }
                }
            }
        })
    }

    async removeUser(ruDTO:RemoveUserDTO,user:any){
        const {userId, folderId} = ruDTO

        return await this.prisma.collaborator.delete({
            where:{
                folderId_userId:{
                    userId,
                    folderId
                }}
            })

    }

}