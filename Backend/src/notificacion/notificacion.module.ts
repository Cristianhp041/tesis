import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { Notification } from './entities/notificacion.entity';
import { ConteoConfig } from './entities/conteo.entity';
import { User } from '../user/entities/user.entity';

import { NotificationService } from './notificacion.service';
import { ConteoService } from './conteo.service';
import { NotificationResolver } from './notificacion.resolver';
import { NotificationScheduler } from './notificacion.scheduler';
import { NotificationSeeder } from './notificacion.seeder';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, ConteoConfig, User]),
    ScheduleModule.forRoot(), 
    AuthModule,
  ],
  providers: [
    NotificationService,
    ConteoService,
    NotificationResolver,
    NotificationScheduler,
    NotificationSeeder,
  ],
  exports: [NotificationService, ConteoService],
})
export class NotificationModule {}