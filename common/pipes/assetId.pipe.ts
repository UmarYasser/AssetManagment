import { ArgumentMetadata, BadRequestException, Inject, Injectable, PipeTransform } from "@nestjs/common";


@Injectable()
export class AssetIdPipe implements PipeTransform<string,string>{
    transform(value: string):string {
        const isStaticFile = /\.(js|css|jpeg)/.test(value)
        if(isStaticFile)
            throw new BadRequestException("Not a vaild assetId")

        return value
    }
}