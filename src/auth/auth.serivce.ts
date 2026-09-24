import { PrismaService } from "src/prisma.service";
import HashingProvider from "./providers/hashing.provider";
import { ConfigService } from "@nestjs/config";
import { BadRequestException, ConflictException, Injectable, Res, UnauthorizedException } from "@nestjs/common";
import { TokenService } from "src/token/token.service";
import { AllowAnonymous } from "common/decotrators/allowanonymous.decorator";
import { FolderService } from "@/folder/folder.service";
import { CreateFolderDTO } from "@/folder/dtos/create-folder.dto";

@Injectable()
export class AuthService{
    constructor(
        private readonly hashingPrv:HashingProvider,
        private readonly prisma:PrismaService,
        private readonly tokenSrv:TokenService,
        private readonly folderSrv:FolderService,
        private readonly configSrv:ConfigService
    ){}

    async signup(body,@Res({passthrough:true}) res:any){
        const hashedPassword = await this.hashingPrv.hash(body.password)
        // 🌟We don't want the confirmPassword here, so we stripe it and use the rest opretor; the cleanest 'mid-level' way
        if(body.confirmPassword !== body.password)
            throw new BadRequestException("Passwords doesn't match")
        
        const {confirmPassword, ...reqBody} = body
        // try{

            let user = await this.prisma.user.create({
                data: {...reqBody, password: hashedPassword},
                select:{
                    id: true, // 👈 Required for generateTokens, but now in the response
                    name:true,
                    email:true, //👇 If we're in development, show the password, otherwise don't
                    password: this.configSrv.get('NODE_ENV') == 'development' ? true : false,
                    role:true
                }
            })

            const token = await this.tokenSrv.generateTokens({sub:user.id,email:user.email,role:user.role})
            const { id, ...dataRes} = user

            // Make a default folder called 'saved'
            const folderDTO:CreateFolderDTO = {folderName:"Saved"}
            const userF = {sub:user.id}
            const savedFolder = await this.folderSrv.create(folderDTO,userF)
            console.log("The saved folder is: ",savedFolder)
            res.cookie('jwt', token.accessT,{
                secure:false, //🚨Must be changed when switching to HTTPS
                httpOnly:true,
                sameSite:'lax',
                maxAge: 3600000,
            })
            
            return {
                ...dataRes,
                ...token,
                savedFolder
            }
        // }catch(err:any){
        //     if(err.code == 'P2002'){ //Unique Constraint Violation
        //         throw new ConflictException('Email already exists')
        //     }
        // }
    }

    async login(body,@Res({passthrough:true}) res:any){
        const user = await this.prisma.user.findUnique({
            where: { email: body.email },
            include: {
                folders: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        userId: true,
                        folderName: true,
                        assetFolder: {
                            take: 2,
                            include: {
                                asset: {
                                    select: {
                                        s3Key: true, // Assuming this is your image path
                                        assetName: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });


        const folders = user?.folders
        if(!user) 
            throw new UnauthorizedException('The email or password are incorrect')
        
        // 🌟 Will use BcryptProvider or Argon2Provider according to useClass in the AuthModule
        const isMatch = await  this.hashingPrv.compare(body.password,user.password)
        if(!isMatch)
            throw new UnauthorizedException('The email or password are incorrect')
        
        const tokens = await this.tokenSrv.generateTokens({sub:user.id,email:user.email,role:user.role})
        
        res.cookie('jwt', tokens.accessT,{
                secure:false,
                // httpOnly:true,
                sameSite:'lax',
                maxAge: 24*60*60*1000,
        })

        
        return {
            id:user.id,
            name:user.name,
            email:user.email,
            role:user.role,
            folders,
            password: this.configSrv.get("NODE_ENV") == 'development' ? user.password : undefined,
            ...tokens
        }
    }

}