import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AllowAnonymous } from 'common/decotrators/allowanonymous.decorator';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @AllowAnonymous()
  // @Get('/') The default route to point to the Home page
  getHello(): string {
    console.log('Hello World From docker compose!');
    console.log(join(__dirname, '..', 'Public'))
    return this.appService.getHello();
  }
} 
