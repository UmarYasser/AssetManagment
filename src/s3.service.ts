import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
    CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } 
    from "@aws-sdk/client-s3";
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

    //✅✅✅Needs Adjustment after Schema changes
    async generateUploadUrl(fileName:string, contentType:string,uuid:string,option?:string){
        const datePrefix=  new Date().toISOString().split('T')[0]
        let folder = `uploads/${datePrefix}-${uuid}` // The main folder of the asset in s3
        let fileKey:string
        let ext:string = contentType.split('/')[1]
        if(option=='cover'){
            fileKey = `${folder}/cover/${fileName.split('.')[0]}.png`
        }else
            fileKey = `${folder}/${fileName}.${ext}`
        // const folder = `uploads/${datePrefix}-${uuid}`

        console.log(`Content Type passed into the signedUrl: ${contentType}`)
        // Which means the s3 folder containts mulitple files
        const command = new PutObjectCommand({
            Bucket : this.configSrv.get('AWS_BUCKET_NAME'),
            Key: fileKey,
            ContentType: contentType, // Default if content type is not provided
        })

        const signedUrl = await getSignedUrl(this.s3,command, {
            expiresIn: 60*5,
            signableHeaders: new Set(['content-type', 'host'])
        }) // 🌟Takes secs not millises like jwt

        return {signedUrl, fileKey}
    }

    //⭐For Videos: Multipart as chucks
    async startMPU(fileName:string, contentType:string){
        const datePrefix=  new Date().toISOString().split('T')[0]
        const fileKey = `uploads/${datePrefix}-${uuid()}/${fileName}`

        const command = new CreateMultipartUploadCommand({
            Bucket: this.configSrv.get('AWS_BUCKET_NAME'),
            Key: fileKey,
            ContentType: contentType
        })

        const {UploadId} = await this.s3.send(command)
        return {UploadId,Key: fileKey}
    }

    async getUploadUrlMPU(fileName:string,uploadId:string, partNumber:number){
        
        const command = new UploadPartCommand({
            Bucket: this.configSrv.get('AWS_BUCKET_NAME'),
            Key: fileName,
            UploadId: uploadId,
            PartNumber: partNumber
        })
        const signedUrl = await getSignedUrl(this.s3,command, {expiresIn:60*5})
        return signedUrl
    }

    async completeMPU(fileName:string,uplaodId:string, parts:{ETag:string, PartNumber:number}[]){
        const command = new CompleteMultipartUploadCommand({
            Bucket: this.configSrv.get('AWS_BUCKET_NAME'),
            Key: fileName,
            UploadId: uplaodId,
            MultipartUpload: { Parts: parts }
        })
        const res = await this.s3.send(command)
        return res
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