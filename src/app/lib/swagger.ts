import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication, configService: ConfigService) => {
    const config = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE') || "Auth API")
    .setDescription(configService.get('SWAGGER_DESCRIPTION') || "Auth API Documentation.")
    .setVersion(configService.get('APP-VERSION') || "0.0.1")
    .addTag('Endpoints')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory);
}