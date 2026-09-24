import { Bind, Controller, Get, NotFoundException, Param, ParseFilePipe, Query, Res } from "@nestjs/common";
import { AllowAnonymous } from "common/decotrators/allowanonymous.decorator";
import { AssetIdPipe } from "common/pipes/assetId.pipe";
import type { Response } from "express";
import { join } from "path"


async function getPage(page,response){
    const filePath = join(process.cwd(), 'Public',  page, 'index.html');
    return response.sendFile(filePath)
}

@Controller()
export class Pages{
    
    @AllowAnonymous()
    @Get(['login',''])
    async login(@Res() res: Response){
        await getPage('login',res)
    }

    @AllowAnonymous()
    @Get(['home'])
    async home(@Res() res: Response){
        await getPage('Home',res)
    }
    
    @AllowAnonymous()
    @Get('asset')
    async asset(@Query('id') id:string,@Res() res: Response){
        console.log(`Query String: ${id}`)
        await getPage('Asset',res)
    }

    @AllowAnonymous()
    @Get('create')
    async create(@Query('id') id:string,@Res() res: Response){
        console.log(`Query String: ${id}`)
        await getPage('Create',res)
    }

    @AllowAnonymous()
    @Get('creator')
    async creator(@Query('id') id:string,@Res() res: Response){
  
        console.log(`Query String: ${id}`)
        await getPage('Creator',res)
    }



}