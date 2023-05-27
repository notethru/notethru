import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
import { JwtAuthGaurd } from './auth/gaurds/jwt-auth.gaurd';

async function bootstrap() {
  config();
  //chokidar for watching blogs folder

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
    }),
  );
  app.useGlobalGuards(new JwtAuthGaurd(new Reflector()));
  await app.listen(5000);
}
bootstrap();
