// src/user/user.module.ts - CORREGIDO ✅
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { UserResolver } from './user.resolver';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    forwardRef(() => AuthModule),
    EmailModule,
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}