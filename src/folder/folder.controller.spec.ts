import { Test, TestingModule } from "@nestjs/testing";
import { FolderService } from "./folder.service"
import { PrismaService } from "@/prisma.service";
import { prismaMock, prismaNotFound, s3Mock } from "common/mocks/testing.mock";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AssetService } from "@/asset/asset.service";
import { ConfigService } from "@nestjs/config";
import { S3Service } from "@/s3.service";
import { NotFound, ReplicationTimeStatus } from "@aws-sdk/client-s3";
import { reportUnhandledError } from "rxjs/internal/util/reportUnhandledError";
import { UpdateFolderDTO } from "./dtos/update-folder.dto";


describe("Folder Controller", ()=>{
    let srv:FolderService;

    beforeEach(async()=>{
        jest.clearAllMocks()
        const module:TestingModule = await Test.createTestingModule({
            providers:[FolderService, AssetService, ConfigService, 
                {
                    provide:PrismaService,
                    useValue:prismaMock
                },
                {
                    provide:S3Service,
                    useValue: s3Mock
                }
            ]
        }).compile()

        srv= module.get<FolderService>(FolderService)
    })

    describe("Create Folder",()=>{}) //Not Needed
    describe("View Folder",()=>{
        describe("Get Assets By Folder",() =>{

            it("Should prevent the user from accessing", async()=>{
                const userMock = {sub:'1', name:"umar", role:'user'}
                const folderMock = {id:'2', name:"Mosques",isPublic:false, userId:'2',
                    assetFolder: {asset: {id:'2', assetName:"Game3 El-fat7"}}
                }

            prismaMock.folder.findUnique.mockResolvedValue(folderMock)

            await expect(srv.getByFolder('2',userMock))
            .rejects.toThrow(new UnauthorizedException("You are not authorized to access this folder"))

            })
            
            it("Should allow the user when he's an admin or an owner from accessing", async()=>{
                const userMock = {sub:'1', name:"umar", role:'admin'}
                const folderMock = {id:'2', name:"Mosques",isPublic:false, userId:'1',
                    assetFolder: {asset: {id:'2', assetName:"Game3 El-fat7"}}
                }
                
                prismaMock.folder.findUnique.mockResolvedValue(folderMock)
                const result = await srv.getByFolder(folderMock.id, userMock)
                
                expect(result).not.toBe(null)
                expect(prismaMock.folder.findUnique).toHaveBeenCalled()
            })

            it("Should allow anyone if the folder is public", async()=>{
                const userMock = {sub:'1', name:"umar", role:'user'}
                const folderMock = {id:'2', name:"Mosques",isPublic:true, userId:'3',
                    assetFolder: {asset: {id:'2', assetName:"Game3 El-fat7"}}
                }
                
                prismaMock.folder.findUnique.mockResolvedValue(folderMock)
                const result = await srv.getByFolder(folderMock.id, userMock)
                
                expect(result).not.toBe(null)
                expect(prismaMock.folder.findUnique).toHaveBeenCalled()
            })
        })

        describe("Get By User", ()=>{
            it("Should not show the private folders",async ()=>{
                const userMock = {sub:"2", name:'umar', role:'user'}
                const folderPubMock = {id:'1',name:"Public Mosques", 
                    isPublic:true, userId:"1",
                     assetFolder:{ asset:{id:'1',assetName:"public Mosque"}}
                    }
                
                const folderPriMock = {id:'2',name:"Private Mosques",
                     isPublic:false, userId:"1",
                    assetFolder:{ asset:{id:'1',sasetName:"public Mosque"}}
                }

                prismaMock.folder.findMany.mockResolvedValue(folderPubMock)
                const result = await srv.getByUser('1',userMock)

                expect(result).toMatchObject(folderPubMock)
                expect(result).not.toMatchObject(folderPriMock)
            })
            
            it("Should Show private folders", async()=>{
                const userMock = {sub:"2", name:'umar', role:'admin'}
                const folderPubMock = {id:'1',name:"Public Mosques", 
                    isPublic:true, userId:"1",
                     assetFolder:{ asset:{id:'1',assetName:"public Mosque"}}
                    }
                
                const folderPriMock = {id:'2',name:"Private Mosques",
                     isPublic:false, userId:"1",
                    assetFolder:{ asset:{id:'1',sasetName:"public Mosque"}}
                }
    
                prismaMock.folder.findMany.mockResolvedValue([folderPubMock,folderPriMock])
                const result = await srv.getByUser('1',userMock)
    
                // expect(result).toMatchObject([folderPubMock,folderPriMock])
                expect(prismaMock.folder.findMany).toHaveBeenCalledWith(
                            expect.objectContaining({
                                where: expect.objectContaining({isPublic: undefined})
                            })
                )
            })
        })

        describe("Get By Id",()=>{
            it("Should return NotFoundException for a private or non-existing",async()=>{
            
                const userMock = {sub:'1', name:"umar", role:'user'}
                const folderMock = {id:'2', name:"Mosques",isPublic:false, userId:'2',
                    assetFolder: {asset: {id:'2', assetName:"Game3 El-fat7"}}
                }
                
                prismaMock.folder.findUnique.mockRejectedValue(new NotFoundException("Folder not found"))
                // const result = await srv.getById(folderMock.id,userMock)
                
                await expect(srv.getById(folderMock.id,userMock))
                .rejects.toThrow(new NotFoundException("Folder not found"))
            })
            
            it("Should return the folder for an admin or a user", async() =>{
                const userMock = {sub:'1', name:"umar", role:'user'}
                const folderMock = {id:'2', name:"Mosques",isPublic:false, userId:'2',
                    assetFolder: {asset: {id:'2', assetName:"Game3 El-fat7"}}
                }

                prismaMock.folder.findUnique.mockResolvedValue(folderMock)

                const result = await srv.getById(folderMock.id,userMock)

                expect(result).toMatchObject(folderMock)
            })
        })


    })
    describe("Update Folder",()=>{
        it("Should prevent the user from accessing", async ()=>{
            const folderMock = {id:'1', name:"Mosques", isPublic:false, 
                userId:'2'
            }
            const userMock = {id:'1', name:"umar", role:"user"}
            const dtoMock= {name:"newName"} as unknown as UpdateFolderDTO
            prismaMock.folder.update.mockRejectedValue(prismaNotFound())

            await expect(srv.edit(folderMock.id,dtoMock,userMock))
            .rejects.toThrow(prismaNotFound())
            
        })
        
        it("Should allow the owner or an admin", async ()=>{
            const folderMock = {id:'1', name:"Mosques", isPublic:false, 
                userId:'1'
            }
            const folderUpMock = {id:'1', name:"newName", isPublic:false, 
                userId:'1'
            }
            const userMock = {id:'1', name:"umar", role:"user"}
            const dtoMock= {name:"newName"} as unknown as UpdateFolderDTO
            prismaMock.folder.update.mockResolvedValue(folderUpMock)
            
            const result = await srv.edit(folderMock.id,dtoMock,userMock)
            expect(result).toMatchObject(folderUpMock)
               
        })
    }) //Not Needed

    describe("Delete Folder",()=>{
        it("Should Prevent the unauthorized user", async()=>{
            const folderMock = {id:'1', name:"Mosques", ownerId:'2'}
            const userMock = {sub:"1",name:"umar",role:'user'}
            
            prismaMock.folder.findUnique.mockResolvedValue(folderMock)
            
            await expect(srv.deleteFolder(folderMock.id,userMock))
            .rejects.toThrow(new UnauthorizedException("You are not authorized to delete this folder"))
        })
        
        describe("Delete Asset From Folder",()=>{
            it("Should return NotFoundException for non-existing folder", async ()=>{
                const folderMock = {id:'1', name:"Mosques", ownerId:'2',
                    assetFolder:{ asset:{id:'1',name:"asset"} }
                }
                const userMock = {sub:"1",name:"umar",role:'user'}

                prismaMock.folder.findUnique.mockResolvedValue(null)

                await expect(srv.deleteAsset(folderMock.id,folderMock.assetFolder.asset.id,userMock))
                .rejects.toThrow(new NotFoundException("Folder not found"))

            })

            it("Should return NotFoundException for non-existing asset", async ()=>{
                const folderMock = {id:'1', name:"Mosques", ownerId:'2',
                    assetFolder:{ }
                }
                const userMock = {sub:"1",name:"umar",role:'user'}

                prismaMock.folder.findUnique.mockResolvedValue(null)

                await expect(srv.deleteAsset(folderMock.id,'1',userMock))
                .rejects.toThrow(new NotFoundException("Folder not found"))

            })
        })
    })
})