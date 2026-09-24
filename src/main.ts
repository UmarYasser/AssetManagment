import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from 'common/filters/prisma-exceptions.filter';
import cookieParser from 'cookie-parser';

const pagesArray = ['','home', 'creator/:id', 'asset/:id', 'create']
//🚨Make a global prisma exception handler
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(express.static(join(__dirname, 'Public')));
  app.use(cookieParser())
  app.setGlobalPrefix('/api/v1',{
    exclude:  pagesArray.map(page => ({
    path: page,
    method: RequestMethod.GET,
  })),
  })
    
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true,
       transform: true /*, transformOptions: { enableImplicitConversion: true }*/ }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

