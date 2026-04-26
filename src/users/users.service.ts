import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { PrismaService } from "src/prisma.service";
import { UpdateUserDTO } from "./dtos/update-user.dto";

@Injectable()
export class UserService{
    constructor(
        private prisma:PrismaService
    ){}

    async getAll(){
        return this.prisma.user.findMany({
            where:{isActive:true},
            take: 100,
            skip:0
        })
    }
    
    async getOne(id:string){
        return this.prisma.user.findUnique({where: {id,isActive:true}})
    }

    async update(id:string,body:UpdateUserDTO){
        if(body.password) return {error: "The Password can't be updaated form this endpoint"}

        return this.prisma.user.updateMany({
            where:{id,isActive:true},
            data:body
        })
    }

    async delete(id:string){
        return this.prisma.user.update({
            where:{id,isActive:true},
            data:{isActive:false}
        })
    }
}