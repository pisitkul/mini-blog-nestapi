import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { LoggerMiddleware } from './logger/logger.middleware';

@Module({
  imports: [
    // configModule เป็นการตั้งค่าให้ ConfigService อ่านไฟล์ .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule, // เรียกใช้ AuthModule
    PassportModule, // เรียกใช้ PassportModule
  ],
  controllers: [AppController], // เรียกใช้ AppController
  providers: [JwtStrategy], // เรียกใช้ AppService และ JwtStrategy
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
