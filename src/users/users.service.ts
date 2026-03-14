import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  async findAll(filters?: {
    role?: UserRole;
    status?: UserStatus;
    department?: string;
  }) {
    const query = this.userRepo.createQueryBuilder('user');
    if (filters?.role)
      query.andWhere('user.role = :role', { role: filters.role });
    if (filters?.status)
      query.andWhere('user.status = :status', { status: filters.status });
    if (filters?.department)
      query.andWhere('user.department = :department', {
        department: filters.department,
      });
    return query.orderBy('user.createdAt', 'DESC').getMany();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepo.remove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepo.update(id, {
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
    });
  }

  async incrementFailedLogin(id: string): Promise<void> {
    const user = await this.findById(id);
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    await this.userRepo.save(user);
  }

  async getStats() {
    const total = await this.userRepo.count();
    const byRole = await this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.role')
      .getRawMany();
    return { total, byRole };
  }
}
