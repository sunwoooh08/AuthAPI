import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './';
import { setupSwagger } from './lib';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import { DecodeBodyPipe } from '@/common/pipe';
import helmet from 'helmet';

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
    new ValidationPipe({ 
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  ];

  app.useGlobalPipes(...globalPipes);
  app.use(helmet())

  await app.listen(configService.get('APP-PORT') ?? 8173);
}

bootstrap();
