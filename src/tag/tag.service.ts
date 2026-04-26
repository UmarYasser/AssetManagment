import { PrismaService } from "@/prisma.service";
import { CreateTagDTO } from "./dtos/create-tag.dto";

//🚨Finish TagSerivce
export class TagService{
    constructor(
        private readonly prisma: PrismaService
    ){}

    async createMany(body:any){
        // let bodyObj:any = body.tags.map(tag => {
        //     return {name: tag}
        // })

        // console.log(bodyObj)
        // const tags = await this.prisma.tag.createMany({
        //     data: bodyObj,
        //     skipDuplicates:true,

        // })
        const results:any = [];
        for (const name of body.tags) {
            const tag = await this.prisma.tag.upsert({
            where: { name: name },
            update: {},
            create: { name: name },
            select: { name: true } // FORCE it to ignore all relations
            });
            results.push(tag);
        }
        return results
        // return {tags}
    }

}