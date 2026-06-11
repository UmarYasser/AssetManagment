import { Injectable } from "@nestjs/common";
import HashingProvider from "./hashing.provider";
import * as bcrypt from 'bcrypt'

@Injectable()
export default class BcryptProvider extends HashingProvider{
    constructor() {
        super();
    }
    async hash(plainText:string){
        let salt:string = await bcrypt.genSalt()
        return await bcrypt.hash(plainText,salt)
    }

    async compare(plainText: string | Buffer, hashedText: string ): Promise<boolean> {
        return bcrypt.compare(plainText,hashedText)
    }
}