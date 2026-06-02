import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from 'common/filters/prisma-exceptions.filter';

//🚨Make a global prisma exception handler
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1')
    
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true,
       transform: true /*, transformOptions: { enableImplicitConversion: true }*/ }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

/*

 {"modelName":"User","driverAdapterError":{"name":"DriverAdapterError","cause":{"originalCode":"23505","originalMessage":"duplicate key value violates unique constraint \"users_email_key\"","kind":"UniqueConstraintViolation","constraint":{"fields":["email"]}}}}

*/
