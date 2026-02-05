// src/notificacion/notificacion.module.ts - CORREGIDO ✅
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { Notification } from './entities/notificacion.entity';
import { User } from '../user/entities/user.entity';
import { AsignacionMensual } from '../conteo/entities/asignacion-mensual.entity';
import { PlanConteoAnual } from '../conteo/entities/plan-conteo-anual.entity';

import { NotificationService } from './notificacion.service';
import { ConteoService } from './conteo.service';
import { NotificationResolver } from './notificacion.resolver';
import { NotificationScheduler } from './notificacion.scheduler';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { EmailTestController } from '../email/email-test.controller'; // 🆕 Mover aquí

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User,
      AsignacionMensual,
      PlanConteoAnual,
    ]),
    ScheduleModule.forRoot(),
    forwardRef(() =>AuthModule),
    EmailModule,
  ],
  controllers: [EmailTestController], // 🆕 Agregar aquí
  providers: [
    NotificationService,
    ConteoService,
    NotificationResolver,
    NotificationScheduler,
  ],
  exports: [NotificationService, ConteoService],
})
export class NotificationModule {}