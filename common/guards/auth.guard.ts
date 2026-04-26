
import { PrismaService } from '@/prisma.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Roles } from 'common/decotrators/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
      private jwtService: JwtService,
      private reflector: Reflector,
      private readonly prisma: PrismaService
    ) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(), // Checks the function
      context.getClass(),   // Checks the Controller
    ]);
    console.log("🌟Is this route public?", isPublic)
    if(isPublic)
      return true


    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) 
      throw new UnauthorizedException('No token provided');
    
    try {
      const payload = await this.jwtService.verifyAsync(token,{secret: process.env.JWT_SECRET});
      if (!payload || !payload.role) 
        throw new UnauthorizedException('Invalid token payload or missing role');

    
      // Validate if the user with the id is found and active in the db
      const user = await this.prisma.user.findUnique({
        where: {id: payload.sub, isActive:true}
      })
      
      if(!user)
        throw new UnauthorizedException('User not found or deleted')

      request['user'] = payload;
      const roles = this.reflector.get(Roles, context.getHandler());
      console.log("🌟Required roles for this route:", roles)
      if (!roles) {
        return true; // No roles required, allow access
    }
      if (!roles.includes(request.user.role)) {
        throw new UnauthorizedException('User does not have required role');
    }
    

    } catch (error:any) {
      throw new UnauthorizedException('Invalid token: ' + error.message);
    }
    return true;
  }

  
}
