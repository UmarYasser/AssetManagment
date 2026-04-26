import { Body, Controller, Delete, Get, Post, Put } from "@nestjs/common";
import { Tag } from "generated/prisma/browser";
import { TagService } from "./tag.service";
import { CreateTagDTO } from "./dtos/create-tag.dto";

// 🚨Finish TagController
@Controller('tags')
export class TagController{
    constructor(
        private readonly tagSrv: TagService
    ){}

    @Post('create')
    async createMany(@Body() body:CreateTagDTO){
        return this.tagSrv.createMany(body)
    }

    @Get('getAll')
    async getAll(){}

    @Put('edit')
    async edit(){}

    @Delete('delete')
    async delete(){}
}