import {Controller, Get, Post, Patch, Delete, Body, Param} from '@nestjs/common'
import {UserService} from './users.service'
import {CreateUserDto} from './dtos/create-user.dto'
import { UpdateUserDTO } from './dtos/update-user.dto'

@Controller('users')
export class UserController{
    constructor(
        private readonly userSrv:UserService
    ){}

    @Get('getAll')
    async getAll(){
        return this.userSrv.getAll()
    }

    @Get('getOne/:id')
    async getById(@Param('id') id:string){
        return this.userSrv.getOne(id)
    }

    @Patch('update/:id')
    async update(@Param('id') id:string, @Body() body:UpdateUserDTO){
        return this.userSrv.update(id,body)
    }
    
    @Delete('delete/:id')
    async delete(@Param('id') id:string){
        console.log("A User was deleted")
        return this.userSrv.delete(id)
    }
}