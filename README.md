# mini-blog-nestapi

A beginner-friendly NestJS project for learning and experimenting with Nest framework.

โปรเจกต์ตัวอย่างสำหรับการเรียนรู้และทดลองใช้งาน NestJS ครั้งแรก  
เน้นการสร้าง API แบบง่าย ๆ พร้อมแนะนำพื้นฐานสำคัญของ NestJS

## Project overview

- สร้าง RESTful API สำหรับจัดการบล็อกอย่างง่าย
- ใช้ In-memory database เพื่อความสะดวกในการเรียนรู้
- ประกอบด้วยโมดูล Posts และ Users
- มีระบบ Authentication เบื้องต้นด้วย JWT
- มีการใช้ Validation, Guards, และ Interceptors

## วิธีการติดตั้งและเริ่มใช้งาน NestJS

```bash
# ติดตั้ง NestJS CLI
npm i -g @nestjs/cli

# สร้างโปรเจกต์ใหม่
nest new mini-blog-nestapi

# สร้าง module ใหม่
nest g module users

# สร้าง controller ใหม่
nest g controller users

# สร้าง service ใหม่
nest g service users

# สร้าง resource ครบชุด (CRUD)
nest g resource posts
```

## Run project

```bash
# เริ่มโหมดพัฒนา (watch mode)
pnpm run start:dev

# เริ่มโหมด production
pnpm run start:prod
```

## โครงสร้างและพื้นฐานสำคัญของ NestJS ที่ควรรู้

### 1. Modules (@Module)

- โมดูลเป็นหน่วยหลักของโปรเจกต์
- รวบรวม controller, service และ provider
- ทุกโปรเจกต์ต้องมี AppModule เป็นโมดูลหลัก
- สามารถแบ่งเป็น Feature Modules เพื่อแยกส่วนการทำงานให้เป็นระเบียบ

```typescript
@Module({
  imports: [UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
```

### 2. Controllers (@Controller)

- จัดการรับ request และส่ง response
- กำหนดเส้นทาง API (route) เช่น @Get(), @Post()
- ใช้ @Param(), @Query(), @Body() เพื่อรับข้อมูลจาก request
- สามารถใช้ @HttpCode() เพื่อกำหนด status code

```typescript
@Controller('posts')
export class PostsController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }
  
  @Post()
  @HttpCode(201)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }
}
```

### 3. Services / Providers (@Injectable)

- เขียน business logic หรือฟังก์ชันการทำงาน
- NestJS ใช้ Dependency Injection ในการจัดการ
- ควรแยก business logic ออกจาก controllers เสมอ

```typescript
@Injectable()
export class PostsService {
  private readonly posts = [];
  
  create(createPostDto: CreatePostDto) {
    this.posts.push(createPostDto);
    return createPostDto;
  }
  
  findAll() {
    return this.posts;
  }
}
```

### 4. Dependency Injection (DI)

- ระบบจัดการการสร้างและส่งมอบ instance ของ class อัตโนมัติ
- ใช้ constructor injection เช่น

```typescript
constructor(private readonly userService: UserService) {}
```

- ช่วยให้การทดสอบทำได้ง่ายผ่านการ mock dependencies
- สามารถใช้ @Optional() สำหรับ dependency ที่ไม่จำเป็น

### 5. Middleware

- ทำงานก่อนถึง controller
- ใช้สำหรับ logging, authentication, หรือแก้ไข request/response
- สามารถใช้เป็น class หรือ function middleware

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
```

### 6. Pipes

- ใช้แปลงหรือ validate ข้อมูลที่รับเข้ามา
- เช่น ใช้ร่วมกับ class-validator เพื่อเช็คข้อมูล request
- Pipes ที่มีให้ใช้แล้ว: ValidationPipe, ParseIntPipe, ParseBoolPipe
- สามารถสร้าง Custom Pipes ได้

```typescript
// DTO with validation
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;
  
  @IsEmail()
  email: string;
}

// Using ValidationPipe
@Post()
create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

### 7. Guards

- ใช้ควบคุมการเข้าถึง route (authorization)
- เช่น ตรวจสอบ token หรือสิทธิ์ผู้ใช้
- ทำงานหลังจาก middleware แต่ก่อน interceptor และ pipe

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }
  
  private validateRequest(request: any) {
    // ตรวจสอบ token หรือสิทธิ์
    return true;
  }
}

// การใช้งาน Guard
@UseGuards(AuthGuard)
@Get('profile')
getProfile() {
  return { message: 'This is protected route' };
}
```

### 8. Exception Filters

- จัดการ error ที่เกิดขึ้นและส่ง response ที่เหมาะสม
- NestJS มี built-in exception layer จัดการ HTTP exceptions
- สามารถสร้าง custom exception filters ได้

```typescript
// สร้าง custom exception
export class CustomException extends HttpException {
  constructor() {
    super('This is a custom exception', HttpStatus.BAD_REQUEST);
  }
}

// สร้าง filter
@Catch(CustomException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: CustomException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 9. Interceptors

- ดักจับและแปลง request/response
- เช่น logging, transforming response, error handling, caching
- ใช้ RxJS operators เพื่อจัดการกับ response stream

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        return { data, timestamp: new Date().toISOString() };
      }),
    );
  }
}

// การใช้งาน
@UseInterceptors(TransformInterceptor)
@Get()
findAll() {
  return this.service.findAll();
}
```

### 10. Lifecycle Hooks

- เช่น OnModuleInit, OnApplicationBootstrap เพื่อจัดการ logic ก่อน/หลัง module หรือแอปทำงาน
- ลำดับการทำงาน: OnModuleInit -> OnApplicationBootstrap -> OnModuleDestroy -> BeforeApplicationShutdown -> OnApplicationShutdown

```typescript
@Injectable()
export class AppService implements OnModuleInit, OnApplicationBootstrap {
  onModuleInit() {
    console.log('Module has been initialized!');
  }
  
  onApplicationBootstrap() {
    console.log('Application has been bootstrapped!');
  }
}
```

### 11. ConfigModule และ Environment Variables

- ใช้จัดการการตั้งค่าโปรเจกต์และอ่านค่า .env
- ติดตั้งผ่าน @nestjs/config
- ช่วยในการจัดการค่า configuration ตาม environment

```typescript
// ติดตั้ง ConfigModule
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
})
export class AppModule {}

// การใช้งาน
@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  
  getDbConfig() {
    const dbUser = this.configService.get<string>('DATABASE_USER');
    return { dbUser };
  }
}
```

### 12. Testing

- NestJS มีเครื่องมือสำหรับเขียน unit test และ e2e test
- ใช้ Jest เป็น test runner หลัก
- มี TestingModule สำหรับสร้าง test module

```typescript
describe('CatsController', () => {
  let controller: CatsController;
  let service: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [CatsService],
    }).compile();

    controller = module.get<CatsController>(CatsController);
    service = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

### 13. Validation และ Serialization

- ใช้ class-validator และ class-transformer สำหรับ validate และแปลงข้อมูล
- ช่วยป้องกัน invalid data และแปลง response ตามที่ต้องการ

```typescript
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;
  
  @IsEmail()
  email: string;
  
  @IsOptional()
  @IsString()
  bio?: string;
}
```

### 14. Database Integration

- รองรับ ORM หลายตัว เช่น TypeORM, Sequelize, Mongoose, Prisma
- สามารถทำ database migrations เพื่อควบคุมการเปลี่ยนแปลง schema

```typescript
// TypeORM Entity
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  name: string;
  
  @Column({ unique: true })
  email: string;
  
  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}
```

### 15. Microservices

- รองรับหลาย transport layer เช่น Redis, MQTT, RabbitMQ, gRPC, Kafka
- สามารถแยกเป็น microservices ที่สื่อสารกันผ่าน message pattern

```typescript
// main.ts ของ microservice
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.TCP,
  options: {
    host: 'localhost',
    port: 8877,
  },
});
```

### 16. WebSockets

- รองรับ real-time communications ผ่าน @nestjs/websockets
- ใช้ decorators เช่น @WebSocketGateway, @SubscribeMessage

```typescript
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }
  
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    this.server.emit('newMessage', payload);
  }
}
```

## เรียนรู้เพิ่มเติม

- [NestJS Documentation](https://docs.nestjs.com/) - เอกสารอย่างเป็นทางการ
- [NestJS Tutorial Video Courses](https://courses.nestjs.com/) - คอร์สเรียนวิดีโอจากทีม NestJS
- [Discord Community](https://discord.gg/nestjs) - ชุมชนนักพัฒนา NestJS
- [NestJS GitHub Repository](https://github.com/nestjs/nest) - Source code และ examples
- [Awesome NestJS](https://github.com/juliandavidmr/awesome-nestjs) - รวมบทความ, libraries, และทรัพยากรเกี่ยวกับ NestJS
- [NestJS Recipes](https://github.com/nestjs/nest/tree/master/sample) - ตัวอย่างโค้ดสำหรับการใช้งานในรูปแบบต่างๆ

## โครงสร้างโปรเจกต์ที่แนะนำ

```
src/
├── common/                 # โค้ดที่ใช้ร่วมกันทั้งแอป
│   ├── decorators/        # Custom decorators
│   ├── filters/           # Exception filters
│   ├── guards/            # Authentication guards 
│   ├── interceptors/      # Global interceptors
│   ├── middleware/        # Middleware functions
│   └── pipes/             # Custom validation pipes
├── config/                # ไฟล์ config ต่างๆ
├── modules/
│   ├── auth/              # Authentication module
│   ├── posts/             # Posts feature module
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── entities/     # Database entities
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   └── posts.module.ts
│   └── users/             # Users feature module
├── app.module.ts          # Root module
└── main.ts               # Entry point
```

## ตัวอย่าง API Endpoints

| Method | Endpoint             | Description           | Access        |
|--------|----------------------|-----------------------|---------------|
| POST   | /auth/register       | สมัครสมาชิกใหม่          | Public        |
| POST   | /auth/login          | เข้าสู่ระบบ              | Public        |
| GET    | /posts               | ดึงรายการบทความทั้งหมด    | Public        |
| GET    | /posts/:id           | ดึงบทความตาม ID        | Public        |
| POST   | /posts               | สร้างบทความใหม่         | Authenticated |
| PATCH  | /posts/:id           | แก้ไขบทความ            | Owner         |
| DELETE | /posts/:id           | ลบบทความ              | Owner/Admin   |
| GET    | /users/profile       | ดึงข้อมูลผู้ใช้          | Authenticated |

## License

MIT Licensed.