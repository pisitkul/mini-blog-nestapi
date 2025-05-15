import { Controller, Get, Version } from '@nestjs/common';
import { InfoResponseDto } from './dto/info-response.dto';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  // constructor(private readonly appService: AppService) {}
  // *NOTE: ไม่ได้ใช้งาน app.service เพราะว่า ไม่มี logic และ ลบ ไฟล์ ไป
  // ถ้าหาก ต้องการใช้งาน app.service ใช้งาน cli เป็น `nest g service app`
  // ถ้า ใน กรณีนี้ ใน src มี app.controller.spec.ts cli จะไปสร้าง directory ใหม่ เป็น app/app.service.ts , app/app.service.spec.ts
  // แต่ถ้าจะสร้างใน src ต้อง ใช้งาน เป็น nest g s --flat (การใช้งาน --flat จะเป้นการบอก cli ว่า ไม่ต้องสร้าง directory ใหม่)
  // ก็จะ สร้าง app.service.ts ใน src

  // ปล่อย constructor ว่าง ไว้ เพราะว่า ไม่มีการใช้งาน services
  constructor() {}

  @Get()
  getRoot(): object {
    return { message: 'Welcome to NestJS API' };
  }

  @Get('/health')
  @Version('2')
  getHealth(): object {
    return {
      status: 'OK',
      message: 'NestJs API is Heady',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/info')
  @Version('1')
  @ApiOperation({ summary: 'api info' })
  @ApiResponse({ status: 200, description: 'Success', type: InfoResponseDto })
  getApiInfo(): InfoResponseDto {
    return {
      name: 'NestJS API',
      version: '1.0.0',
      description: 'API documentation for the mini-blog project',
      uptime: process.uptime(),
    };
  }
}
