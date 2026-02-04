import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  private removePassword(user: User): Omit<User, 'password' | 'verificationCode'> {
    const { password, verificationCode, ...userWithoutSensitive } = user;
    return userWithoutSensitive;
  }

  private async findOneRaw(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'password' | 'verificationCode'>> {
    const exists = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('Ya existe un usuario con ese email');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date();
    verificationCodeExpiry.setHours(verificationCodeExpiry.getHours() + 24);

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = this.userRepository.create({
        ...dto,
        password: hashedPassword,
        active: false,
        emailVerified: false,
        verificationCode,
        verificationCodeExpiry,
      });

      const savedUser = await this.userRepository.save(user);

      // Enviar email de verificación
      await this.emailService.sendVerificationCode(
        savedUser.email,
        savedUser.name,
        verificationCode,
      );

      return this.removePassword(savedUser);
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === '23505') {
        throw new BadRequestException('Ya existe un usuario con ese email');
      }
      throw error;
    }
  }

  async findAll(active: 'true' | 'false' | 'all' = 'true'): Promise<Omit<User, 'password' | 'verificationCode'>[]> {
    const where: Record<string, boolean> = {};

    if (active === 'true') where.active = true;
    if (active === 'false') where.active = false;

    const users = await this.userRepository.find({ where });
    return users.map((u) => this.removePassword(u));
  }

  async findProfile(id: number): Promise<Omit<User, 'password' | 'verificationCode'>> {
    const user = await this.findOneRaw(id);
    return this.removePassword(user);
  }

  async findOne(id: number): Promise<Omit<User, 'password' | 'verificationCode'>> {
    const user = await this.findOneRaw(id);
    return this.removePassword(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<Omit<User, 'password' | 'verificationCode'>> {
    const user = await this.findOneRaw(id);

    if (dto.email && dto.email !== user.email) {
      const existente = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (existente) {
        throw new BadRequestException('Ya existe un usuario con ese email');
      }
    }

    try {
      if (dto.password) {
        dto.password = await bcrypt.hash(dto.password, 10);
      }

      Object.assign(user, dto);

      await this.userRepository.save(user);
      
      const refreshedUser = await this.userRepository.findOne({ where: { id } });
      
      if (!refreshedUser) {
        throw new NotFoundException('Usuario no encontrado después de actualizar');
      }
      
      return this.removePassword(refreshedUser);
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === '23505') {
        throw new BadRequestException('Ya existe un usuario con ese email');
      }
      throw error;
    }
  }

  async deactivate(id: number): Promise<Omit<User, 'password' | 'verificationCode'>> {
    const user = await this.findOneRaw(id);
    
    user.active = false;
    await this.userRepository.save(user);
    
    const refreshedUser = await this.userRepository.findOne({ where: { id } });
    
    if (!refreshedUser) {
      throw new NotFoundException('Usuario no encontrado después de desactivar');
    }
    
    return this.removePassword(refreshedUser);
  }

  async activate(id: number): Promise<Omit<User, 'password' | 'verificationCode'>> {
    const user = await this.findOneRaw(id);
    
    user.active = true;
    await this.userRepository.save(user);
    
    const refreshedUser = await this.userRepository.findOne({ where: { id } });
    
    if (!refreshedUser) {
      throw new NotFoundException('Usuario no encontrado después de activar');
    }
    
    return this.removePassword(refreshedUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateVerification(user: User): Promise<void> {
    await this.userRepository.save(user);
  }
}