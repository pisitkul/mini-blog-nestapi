import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRegisterDTO } from './dto/user-register/user-register.dto';

interface User {
  userId: number;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    // ถ้า username และ password ตรงกัน return user ออกไป
    if (username === 'admin' && pass === '1234') {
      return Promise.resolve({ userId: 1, username });
    }

    // ถ้าไม่ตรงกัน return null
    return Promise.resolve(null);
  }

  // login ไม่ได้ ใช้งาน เป็น async เพราะว่า เป็น แค่ การสร้าง token แบบ ไม่ได้มีการใช้งาน ฟังชั่นที่เป็น async จะต้อง return ออกไป
  login(user: User): { access_token: string } {
    // หลังจาก login สำเร็จ จะเอา  username และ userId มาสร้าง token
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  register(user: UserRegisterDTO) {
    return {
      message: `${user.username} registered successfully`,
    };
  }
}
