import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
    CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } 
    from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {v4 as uuid} from 'uuid'
import { transliterate } from 'transliteration'

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
                secretAccessKey:this.configSrv.get("AWS_SECRET_ACCESS_KEY")!,
            },
            requestChecksumCalculation: 'WHEN_REQUIRED',  // 👈 don't force checksum
            responseChecksumValidation: 'WHEN_REQUIRED',
        })
    }         

    //✅✅✅Needs Adjustment after Schema changes
    async generateUploadUrl(fileName:string, contentType:string,uuid:string,option?:string,keyword?:string){
        const datePrefix=  new Date().toISOString().split('T')[0]
        let folder 
        let fileKey:string
        let ext:string = contentType.split('/')[1]
        // pphoto/uuid-pphoto.png
        if(keyword == 'pphoto'){
            fileKey = `${keyword}/${uuid}-pphoto.png` // The main folder of the asset in s3
            console.log("The is user is uploading a profile photo")
        }
        else{

            folder = `uploads/${datePrefix}-${uuid}` // The main folder of the asset in s3
            
            if(option=='cover'){
                fileKey = `${folder}/cover/${fileName.split('.')[0]}.png`
            }else
                fileKey = `${folder}/${fileName}.${ext}`
        }
        
            console.log("File Key generated for upload",fileKey)
            //⭐Result is pphoto/ffa2c759-8e23-41ed-947d-26a21e46529c-pphoto.png
        // Which means the s3 folder containts mulitple files
        const command = new PutObjectCommand({
            Bucket : this.configSrv.get('AWS_BUCKET_NAME'),
            Key: fileKey,
            ContentType: contentType, // Default if content type is not provided
            ChecksumAlgorithm: undefined
        })
 
        const signedUrl = await getSignedUrl(this.s3,command, {
            expiresIn: 60*5*60,
            // signableHeaders: new Set(['content-type', 'host'])
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

    async generateViewUrl(fileKey:string, filter?:any){
        // uploads/2026-06-22-15b0ce4a-43b3-4d8a-be0e-885b919c30b3/White Eagle with dimensions.jpg
        //✅Make a default image if the one requested isn't found

        if(!fileKey){
            console.log("File Key is empty, returning default image")
            fileKey = 'uploads/2026-07-31-a34c4202-b51e-469c-9a57-b46a322b69b6/notFound.png'
        }
        let fileName = fileKey?.split('/')[fileKey.split('/').length -1]
        console.log("File Name extracted from fileKey:",fileName)
        console.log("File Key:",fileKey)
        let transliterated = transliterate(fileName)
        transliterated = transliterated.replace(/[^a-zA-Z0-9. ]/g,'')

        const command = new GetObjectCommand({
            Bucket: this.configSrv.get('AWS_BUCKET_NAME'),
            Key: fileKey,             
            ResponseContentDisposition: `attachment; filename="${transliterated ? transliterated : 'download'}"` // This forces the download
        });
        console.log(`Translitrated File Name: ${transliterated}, Original File Name: ${fileName}\n---------------`)
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