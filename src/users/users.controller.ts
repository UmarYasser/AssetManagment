import {Controller, Get, Post, Patch, Delete, Body, Param, Req, Query} from '@nestjs/common'
import {UserService} from './users.service'
import {CreateUserDto} from './dtos/create-user.dto'
import { UpdateUserDTO } from './dtos/update-user.dto'
import { Roles } from 'common/decotrators/roles.decorator'

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
    async getById(@Param('id') id:string, @Req() req:any){
        return this.userSrv.getOne(id,req.user)
    }


    @Patch('updateMe')
    async update(@Param('id') id:string, @Body() body:UpdateUserDTO, @Req() req:any){
        return this.userSrv.updateMe(id,body)
    }

    @Roles(['admin'])
    @Patch('upateUser/:id')
    async updateUser(@Param('id') id:string, @Body() body:UpdateUserDTO, @Req() req:any){
        return this.userSrv.updateUser(id,body,req.user)
    }
    
    //If the user is deleting himself, then we just need the user Obj and take the token from it
    //Not trust his input
    @Delete('deleteMe')
    async deleteMe(@Req() req:any){
        return this.userSrv.deleteMe(req.user)
    }

    @Delete('deleteUser/:id')
    async deleteUser(@Param('id') id:string,@Req() req:any,@Query() option:string){
        console.log("A User was deleted")
        return this.userSrv.deleteUser(id,req.user,option)
    }
}