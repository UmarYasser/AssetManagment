import { PrismaService } from "@/prisma.service";

//🚨 Finish AssetTag Service
export class AssetTagService{
    constructor(
        private readonly prisma: PrismaService
    ){}

    
    async link(body:any){
        // return this.prisma.assetTag.create({
        //     data:{
        //         assetId: body.assetId,
        //         tagName: body.tagName
        //     }
        // })
    }
    
}