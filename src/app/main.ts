import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './';
import { setupSwagger } from './lib';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import { DecodeBodyPipe } from '@/common/pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors(
    {
      origin: configService.get<string>("CORS-ORIGIN")?.split(', '),
      credentials: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    } as CorsOptions
  );

  setupSwagger(app, configService);
  app.useGlobalPipes(
    new DecodeBodyPipe(),
    new ValidationPipe({ transform: true })
  );
  await app.listen(configService.get('APP-PORT') ?? 8173);
}

bootstrap();
