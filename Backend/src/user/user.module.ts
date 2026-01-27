import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller'
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { forwardRef } from '@nestjs/common';
import { UserResolver } from './user.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User]), 
  forwardRef(() => AuthModule)],
  providers: [UserService,UserResolver],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
