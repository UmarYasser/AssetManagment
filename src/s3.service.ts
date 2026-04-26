import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {v4 as uuid} from 'uuid'

@Injectable()
export class S3Service{
    constructor(
        private s3: S3Client,
        private readonly configSrv:ConfigService,

    ){
        this.s3 = new S3Client({
            region: this.configSrv.get("AWS_REGION")!,
            credentials:{
                accessKeyId:this.configSrv.get("AWS_ACCESS_KEY_ID")!,
                secretAccessKey:this.configSrv.get("AWS_SECRET_ACCESS_KEY")!
            }
        })
    }

    async generateUploadUrl(fileName:string, contentType:string){
        const datePrefix=  new Date().toISOString().split('T')[0]
        const fileKey = `uploads/${datePrefix}-${uuid()}/${fileName}`

        const command = new PutObjectCommand({
            Bucket : this.configSrv.get('AWS_BUCKET_NAME'),
            Key: fileKey,
            ContentType: contentType
        })

        const signedUrl = await getSignedUrl(this.s3,command, {expiresIn: 60*5}) // 🌟Takes secs not millises like jwt

        return {signedUrl, fileKey}
    }

    async generateViewUrl(fileKey:string){
        const command = new GetObjectCommand({
            Bucket: this.configSrv.get('AWS_BUCKET_NAME'),
            Key: fileKey,
        });

        // This creates a link that is valid for 1 hour (3600 seconds)
        const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
        return url;
    }

    
    async generateDeleteUrl(fileKey:string){
        const command = new DeleteObjectCommand({
            Bucket: this.configSrv.get('AWS_BUCKET_NAME'),
            Key: fileKey
        })

        const url = await getSignedUrl(this.s3, command, {expiresIn: 3600})
        return url
    }
}