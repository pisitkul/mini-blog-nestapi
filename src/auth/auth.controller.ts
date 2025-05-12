import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
  ApiResponse,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Logger } from '@nestjs/common';
import { UserRegisterDTO } from './dto/user-register/user-register.dto';

export class UserLoginDTO {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string;
  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

interface RequestWithUser extends Request {
  user: {
    userId: number;
    username: string;
  };
}
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: UserRegisterDTO })
  register(@Body() body: UserRegisterDTO) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiBody({ type: UserLoginDTO })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        message: 'Internal server error',
        statusCode: 500,
      },
    },
  })
  async login(@Body() body: UserLoginDTO) {
    this.logger.log(body);
    // เรียก service ใน auth.service.ts มาใช้งาน
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );

    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
