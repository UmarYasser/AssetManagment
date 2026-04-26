import { Injectable } from "@nestjs/common";

@Injectable()
export default abstract class HashingProvider{
    abstract hash(plainText:string | Buffer):Promise<string> | any;

    abstract compare(plainText:string | Buffer,hashedText:string): Promise<boolean>|any;
}