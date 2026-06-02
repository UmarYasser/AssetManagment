import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Injectable } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { execve } from 'process';

@Injectable()
@Catch() // Catches all unhandled errors thrown during the request lifecycle
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  
    // constructor(applicationRef?: any){
    //     super(applicationRef)
    // }
  catch(exception: any, host: ArgumentsHost)  {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorName = exception?.name || exception?.constructor?.name;
    let errorCode:string|undefined = exception.code
    console.log(`Error Code: ${errorCode}`)
    // 1. Handle Prisma Validation Errors (Missing fields, bad types)
    if (errorName === 'PrismaClientValidationError') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: exception.message.replace(/\n/g, ' ').trim(), // Clean up Prisma newline formatting
      });
    }

    // 2. Handle Unique Constraints (Prisma Known Request Errors like P2002)
    if (errorName === 'PrismaClientKnownRequestError') {
      if (exception.code === 'P2002') {
        // Prisma provides the target column in exception.meta.target (e.g., ['email'])
        const targetField = exception.meta.driverAdapterError.cause.constraint.fields[0]

        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: `Unique constraint violation on ${targetField} field. This record already exists.`,
        });
      }
    }

    if(errorCode === "P2025"){
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: `The Resource Requested isn't found to be updated or deleted.`,
        });
    }

    // 3. Fallback for any other standard error
    // const status = exception?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    // return response.status(status).json({
    //   statusCode: status,
    //   message: exception?.message || 'Internal server error',
    // });

    //🚨STOPPED HERE: If it doesn't recognize the error, it doesn't output it
    // e.g. if the problem was from the dto normally, it will output the generic response
    return super.catch(exception,host)
  }
}