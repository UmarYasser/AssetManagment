import {Controller, Get, Post, Patch, Delete, Body, Param, Req, Query, UseInterceptors} from '@nestjs/common'
import {UserService} from './users.service'
import {CreateUserDto} from './dtos/create-user.dto'
import { UpdateUserDTO } from './dtos/update-user.dto'
import { Roles } from 'common/decotrators/roles.decorator'
import { AllowAnonymous } from 'common/decotrators/allowanonymous.decorator'
import { Cachable } from 'common/decotrators/cache.decorator'
import { HttpCacheInterceptor } from 'common/interceptors/cache.interceptor'

@Controller('users')
export class UserController{
    constructor(
        private readonly userSrv:UserService
    ){}

    @AllowAnonymous()
    @Get('getAll')
    async getAll(){
        return this.userSrv.getAll()
    }

    @UseInterceptors(HttpCacheInterceptor)
    @Cachable('user')
    @Get('getOne/:id')
    async getById(@Param('id') id:string, @Req() req:any){
        return this.userSrv.getOne(id,req.user)
    }


    @Patch('updateMe/:id')
    async update(@Param('id') id:string, @Body() body:UpdateUserDTO, @Req() req:any){
        return this.userSrv.updateMe(id,body)
    }

    @Roles(['admin'])
    @Patch('updateUser/:id')
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