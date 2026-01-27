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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private removePassword(user: User) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async findOneRaw(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('Ya existe un usuario con ese email');
    }

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = this.userRepository.create({
        ...dto,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);
      return this.removePassword(savedUser);
    } catch (error) {
      if ((error as any).code === '23505') {
        throw new BadRequestException('Ya existe un usuario con ese email');
      }
      throw error;
    }
  }

  async findAll(active: 'true' | 'false' | 'all' = 'true') {
    let where: any = {};

    if (active === 'true') where.active = true;
    if (active === 'false') where.active = false;

    const users = await this.userRepository.find({ where });
    return users.map((u) => this.removePassword(u));
  }

  async findProfile(id: number) {
    const user = await this.findOneRaw(id);
    return this.removePassword(user);
  }

  async findOne(id: number) {
    const user = await this.findOneRaw(id);
    return this.removePassword(user);
  }

  async update(id: number, dto: UpdateUserDto) {
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

      if ((error as any).code === '23505') {
        throw new BadRequestException('Ya existe un usuario con ese email');
      }
      throw error;
    }
  }

  async deactivate(id: number) {
    const user = await this.findOneRaw(id);
    
    user.active = false;
    await this.userRepository.save(user);
    
    const refreshedUser = await this.userRepository.findOne({ where: { id } });
    
    if (!refreshedUser) {
      throw new NotFoundException('Usuario no encontrado después de desactivar');
    }
    
    return this.removePassword(refreshedUser);
  }

  async activate(id: number) {
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
}