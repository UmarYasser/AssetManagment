import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Tag } from "generated/prisma/browser";
import { TagService } from "./tag.service";
import { CreateTagDTO } from "./dtos/create-tag.dto";
import { EditTagDTO } from "./dtos/edit-tag.dto";

// ✅Finish TagController
@Controller('tag')
export class TagController{
    constructor(
        private readonly tagSrv: TagService
    ){}

    @Post('create')
    async createMany(@Body() body:CreateTagDTO){
        return await this.tagSrv.createMany(body)
    }


    @Get('search')
    async search(@Query('name') name:string){
        return await this.tagSrv.search(name)
    }

    @Get('getAll')
    async getAll(){
        return await this.tagSrv.getAll()
    }
    
    @Put('edit')
    async edit(@Body() editTagDto:EditTagDTO){
        return await this.tagSrv.edit(editTagDto)

    }

    @Delete('delete/:id')
    async delete(@Param('id') id:number){
        return await this.tagSrv.delete(id)
    }

}