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
  
  const globalPipes = [
    ...(configService.get<string>('BODY-DATA-ENCRYPTION')?.toLowerCase() == "true" ? [new DecodeBodyPipe()] : []),
    new ValidationPipe({ transform: true }),
  ];

  app.useGlobalPipes(...globalPipes);

  await app.listen(configService.get('APP-PORT') ?? 8173);
}

bootstrap();
