import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception.filters';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorsForResponse = { errorsMessages: [] };
        errors.forEach((e) => {
          const constraintsKeys = Object.keys(e.constraints);
          errorsForResponse.errorsMessages.push({
            message: e.constraints[constraintsKeys[0]],
            field: e.property,
          });
        });
        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  //app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(5000);
}
bootstrap();
