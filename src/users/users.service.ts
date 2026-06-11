import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { PrismaService } from "src/prisma.service";
import { UpdateUserDTO } from "./dtos/update-user.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

@Injectable()
export class UserService{
    constructor(
        private prisma:PrismaService,
        @Inject(CACHE_MANAGER) private cacheMng:Cache,
        
    ){}

    async getAll(){
        return this.prisma.user.findMany({
            where:{isActive:true},
            take: 100,
            skip:0
        })
    }
    
    async getOne(id:string,user:any){
        return this.prisma.user.findUnique({where: {id,
            isActive:user.role == 'admin' ? undefined : true
        }})
    }
    
    async getOneT(id:string){
        return this.prisma.user.findUnique({where: {id,
            isActive: true
        }})
    }

    async updateMe(id:string,body:UpdateUserDTO){
        if(body.password) return {error: "The Password can't be updaated form this endpoint"}

        
        await (this.cacheMng as any).del(`user:${id}`) // Clear cache for the user
        return this.prisma.user.updateMany({
            where:{id,isActive:true},
            data:body
        })
    }

    async   updateUser(id:string, body:any, user:any){
        if(user.role != 'admin')
            throw new UnauthorizedException("This endpoint is accessible for admins only")

        await (this.cacheMng as any).del(`user:${id}`) // Clear cache for the user
        return await this.prisma.user.update({
            where:{ id, isActive:true},
            data:body
        })
    }
    
    async deleteMe(user:any){

        await (this.cacheMng as any).del(`user:${user.id}`) // Clear cache for the user

        return await this.prisma.user.update({
            where:{id:user.sub,isActive:true},
            data:{isActive:false}
        })
    }

    async  deleteUser(id:string,user:any,option?:string){
        if(user.role != 'admin')
            throw new UnauthorizedException("This endpoint is accessible for admin only.")

        if(option == "hard"){
            return await this.prisma.user.delete({
                where:{id}
            })
        }
        
        return await this.prisma.user.update({
            where:{id},
            data:{isActive:false}
        })
    }

}