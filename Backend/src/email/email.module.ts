// src/email/email.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailTestController } from './email-test.controller';
import { User } from '../user/entities/user.entity';
import { Notification } from '../notificacion/entities/notificacion.entity';
import { NotificationService } from '../notificacion/notificacion.service';
import { AuthModule } from '../auth/auth.module'; // 🆕 IMPORTAR
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Notification]),
     forwardRef(() => AuthModule), // 🆕 AGREGAR AuthModule
  ],
  controllers: [EmailTestController],
  providers: [EmailService, NotificationService],
  exports: [EmailService],
})
export class EmailModule {}