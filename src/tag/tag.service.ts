import { PrismaService } from "@/prisma.service";
import { CreateTagDTO } from "./dtos/create-tag.dto";
import { Injectable } from "@nestjs/common";
import { EditTagDTO } from "./dtos/edit-tag.dto";
//✅Finish TagSerivce

@Injectable()
export class TagService{
    constructor(
        private readonly prisma: PrismaService
    ){}

    async createMany(body:any){
        let bodyObj:any = body.tags.map((tag,index) => {
            return {
                name: tag
            }
        })

        console.log(bodyObj)
        const tags = await this.prisma.tag.createManyAndReturn({
            data: bodyObj,
            skipDuplicates:true
        })
        return tags

    }

    async search(name:string){
        return await this.prisma.tag.findMany({
            where:{
                name:{
                    contains:name,
                    mode:'insensitive'
                }
            }
        })
    }

    async getAll(){
        return await this.prisma.tag.findMany();
    }

    async getById(id:number){
        return await this.prisma.tag.findUnique({
            where:{id}
        })
    }

    async edit(editTagDto: EditTagDTO){
        const {id,name} = editTagDto
        return await this.prisma.tag.update({
            where:{id},
            data:{name}
        })
    }

    async delete(id:number){
        return await this.prisma.tag.delete({
            where:{id}
        })
    }

}