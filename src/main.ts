import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // สร้าง config สําหรับ Swagger
  const config = new DocumentBuilder()
    .setTitle('Mini Blog API')
    .setDescription('API documentation for the mini-blog project')
    .setVersion('1.0')
    .addBearerAuth() // สำหรับ JWT
    .build();

  // ใช้งาน Swagger เพื่อสร้างเอกสาร API document
  const document = SwaggerModule.createDocument(app, config);

  // ให้ api Document ใช้งาน path ที่ถูกต้อง
  SwaggerModule.setup('api-docs', app, document);

  // ใช้งาน pipe สำหรับ validation แบบ global
  app.useGlobalPipes(new ValidationPipe());

  // ใช้งาน versioning สําหรับ API
  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
