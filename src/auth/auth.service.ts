import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    // Check if locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        'Account temporarily locked. Please try again later.',
      );
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      await this.usersService.incrementFailedLogin(user.id);
      return null;
    }

    return user;
  }

  async login(user: User) {
    await this.usersService.updateLastLogin(user.id);
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
      },
    };
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    return this.login(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId);
    const valid = await user.comparePassword(currentPassword);
    if (!valid) throw new BadRequestException('Current password is incorrect');
    return this.usersService.update(userId, { password: newPassword });
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }
}
