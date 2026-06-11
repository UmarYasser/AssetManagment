import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client"

export const prismaMock ={
    asset: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    folder:{
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn()
    }
}


export const prismaNotFound = () => {
    return new PrismaClientKnownRequestError("Not Found",{
    code:'P2025',
    clientVersion:'7.8.0'
})}

export const s3Mock = {
    generateUploadUrl: jest.fn(),
    generateViewUrl: jest.fn(),
    generateDeleteUrl: jest.fn(),

}