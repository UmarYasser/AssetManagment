import { Test, TestingModule } from "@nestjs/testing";
import { AssetService } from "./asset.service";
import { Request } from "express";
import { S3Service } from "@/s3.service";
import { prismaMock, prismaNotFound, s3Mock } from "../../common/mocks/testing.mock";
import { PrismaService } from "@/prisma.service";
import { NotFound, S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

import CreateAssetDTO from "./dtos/create-asset.dto";

describe("Asset Service",()=>{
    let srv:AssetService;

    beforeEach(async()=>{
        jest.clearAllMocks()
        // To reset the variables between tests

        const module:TestingModule = await Test.createTestingModule({
            providers:[AssetService, S3Service,S3Client,ConfigService,
                {
                    provide:PrismaService,
                    useValue:prismaMock
                    //⭐When the code wants PrismaService, 
                    // Use the value of our prismaMock for testing,
                    // to avoid making real data in db
                },
                {
                    provide:S3Service,
                    useValue:s3Mock
                }
            ],
        }).compile() //👈responsible for applying the primsaMock before any 'it()' caluse
        // So it uses our mock not the real prisma service that would create data in the db

        srv = module.get<AssetService>(AssetService)
    })

    describe("Upload Asset", ()=>{
        it("Should return video data", async()=>{
            const  reqMock = {assetName:"Test Asset",type:"video/mp4"} as unknown as CreateAssetDTO
            const userMock = {id:'1',name:"umar"}
            
            s3Mock.generateUploadUrl
            .mockResolvedValueOnce({signedUrl: 'cover-url',fileKey:'s3Path'})
            .mockResolvedValueOnce({signedUrl: 'video-url',fileKey:'s3Path'})
            

            const result = await srv.upload(reqMock,userMock.id)
            expect(result.thumbnailUrl).not.toBeNull()
            expect(result.mainUrl)
        })

        it("Should return image data", async()=>{
            const  reqMock = {assetName:"Test Asset",type:"image/png"} as unknown as CreateAssetDTO
            const userMock = {id:'1',name:"umar"}
            
            s3Mock.generateUploadUrl
            .mockResolvedValueOnce({signedUrl: 'image-url',fileKey:'s3Path'})
            

            const result = await srv.upload(reqMock,userMock.id)
            expect(result.thumbnailUrl).toBeNull()
            expect(result.mainUrl).not.toBeNull()
        })
    })

    describe("Viewing Asset",()=>{
        it("Should return 404 the user from viewing private asset", async()=>{
            const userMock = {name:"Tester", id:"2", role:"user"}
            const assetMock = {id:'1',assetName:"private", ownerId:'1'}

            prismaMock.asset.findUnique.mockResolvedValue(null)
            s3Mock.generateViewUrl.mockResolvedValue("url")

            // const result = await srv.getById(assetMock.id,userMock)
            // console./log(result)   
            await expect(srv.getById(assetMock.id,userMock))
            .rejects.toThrow(new NotFoundException("Asset not found"))

            // expect(result.asset.assetName).toBe(null)
            // expect(result.viewUrl).toBe(null)
            expect(s3Mock.generateViewUrl).not.toHaveBeenCalled()
        })

        it("Should return the asset if the user has access", async()=>{
            const assetMock = {id:'1', assetName:'test'}
            const userMock = {id:'1', name:"umar", role:'admin'}

            s3Mock.generateViewUrl.mockResolvedValue('url')
            prismaMock.asset.findUnique.mockResolvedValue({name:"foundAsset"})

            const result = await srv.getById(assetMock.id,userMock)

            expect(s3Mock.generateViewUrl).toHaveBeenCalled()
            expect(result.viewUrl).not.toBeFalsy()
        })
    })

    describe('Update Asset', () =>{

        it("should return NotFoundException when there's no asset with the id in the req",async ()=>{
            const setupUser = {id:"11",name:"user", role:"user"}
            const dtoMock = {id:"11",assetName:'new name'}

            prismaMock.asset.update.mockRejectedValue(prismaNotFound())

            await expect(srv.edit(dtoMock,dtoMock.id,setupUser))
            .rejects.toThrow(prismaNotFound())
            
        })

        it("should return Forbidden Exception if the user isn't and admin and tries to change mainFolder", async()=>{
            const setupUser = {id:"11",name:"imposter", role:"user"}
            const mockAsset = {id:"11", name:"updatedAsset",mainFolder:"1234"}
            
            //Make sure that the db isn't making any changes
            expect(prismaMock.asset.update).not.toHaveBeenCalled()
            
            await expect(srv.edit(mockAsset, mockAsset.id, setupUser)).rejects.toThrow(new ForbiddenException("You can't change the main folder from this endpoint, use the moveto endpoint instead"))
        })
        
        it("should return NotFoundException if the user is admin but the folder isn't found", async() =>{
            
            const setupUser = {id:"11",name:"admin", role:"admin"}
            const mockAsset = {id:"11", name:"updatedAsset",mainFolder:"33"}
            prismaMock.folder.findUnique.mockResolvedValue(null)
            // ⭐Not mockRejectedValue: bec it means that prisma returned an error, while prisma just returns an empty {} when not finding
            // Since this isn't an error and has a status of 200, then it is a RESOLVEDvcalue 'mockResolvedValue
            // While prisma.update returns an error when not finding => mockRejectedValue
            await expect(srv.edit(mockAsset,mockAsset.id,setupUser)).rejects.toThrow(new NotFoundException("Folder not found"))

            expect(prismaMock.folder.findUnique).toHaveBeenCalled()
            expect(prismaMock.asset.update).not.toHaveBeenCalled()
            // ⭐Must be called after calling the service

        })

        it("should udpate the asset: user == admin && folder exists", async ()=>{
            const setupUser = {id:"11",name:"admin", role:"admin"}
            const mockAsset = {id:"11", name:"updatedAsset",mainFolder:"33"}
            const mockFolder = {id:"11",name:"folder",isActive:true}
            
            prismaMock.asset.update.mockResolvedValue(mockAsset)
            prismaMock.folder.findUnique.mockResolvedValue(mockFolder)
           
            await expect( srv.edit(mockAsset,mockAsset.id, setupUser)).resolves
            //havebeenCalledWith
            expect(prismaMock.folder.findUnique).toHaveBeenCalledWith({  where: {id: mockAsset.mainFolder, isActive:true}})
            expect(prismaMock.asset.update).toHaveBeenCalled()
        })


    })

    describe("Delete Asset",()=>{
        it("Should Prevent the user if he's not the owner nor an admin",async()=>{
            const assetMock = {id:'1',assetName:"asset",ownerId:'2'}
            const userMock = {sub:'1', role:'user'}
            
            await expect(srv.delete(assetMock.id,userMock))
            .rejects.toThrow(new ForbiddenException("You are not the owner of this asset"))

            expect(s3Mock.generateDeleteUrl).not.toHaveBeenCalled()
        })
        
        //⭐ Here the logic of the service changed, proving the importance of unit tests for methods with logic branching
        it("Should return the asset for the admin & owner", async()=>{
            const assetMock = {id:'1',assetName:"asset",ownerId:'1', s3Key:'fileKey'}
            const userMock = {sub:'1', role:'admin'}
            
            // prismaMock.asset.delete.mockResolvedValue()
            s3Mock.generateDeleteUrl
            .mockResolvedValueOnce('url')
            const result = await srv.delete(assetMock.id,userMock)
            
            expect(result.asset).not.toBe(null)
            expect(s3Mock.generateDeleteUrl).toHaveBeenCalled()
        })
    })


})

// Unit Testing Steps:
/*
    We make a beforeEach() fn to prevent data leaking between tests: if we want a var. to be empty before each one and not get value from prev test
    We make a describe() function to group test => describe("Asset") => describe("Upload Asset Tests")

    We mock: (can be found in the beforeEach() fn)
    A) The Service Class that we're testing
    B) providers like S3Service, PrismaService and make them 'useValue' from our mock like in the beforeEach() fn
    C) Request Body, User Data from tokens, or assets for updating; depending on the parameters of the method we're testing
    * And all that must be before calling the function in our service mock
    then make expect() for what we really expect:
    like when uploading a image, the thumbnailUrl should not be returned in the response
    => refer to the upload asset return image data test
    

    ⭐Mock returns null → service throws → use rejects.toThrow, never assign to result
*/