import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from './notificacion.service';
import { ConteoService } from './conteo.service';
import { ConteoConfig, ConteoTipo } from './entities/conteo.entity';
import { NotificationType } from './entities/notificacion.entity';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly conteoService: ConteoService,
    @InjectRepository(ConteoConfig)
    private readonly conteoConfigRepository: Repository<ConteoConfig>,
  ) {}

  /**
   * CRON JOB - Se ejecuta todos los días a las 8:00 AM
   * 
   * Verifica:
   * 1. Si se acerca la fecha de conteo mensual
   * 2. Si se acerca la fecha de conteo anual
   * 3. Si ya pasó alguna fecha y no se completó
   */
  @Cron('0 8 * * *', {
    name: 'check-conteo-notifications',
    timeZone: 'America/Havana', // Ajusta según tu zona horaria
  })
  async handleConteoNotifications() {
    this.logger.log('🔔 Iniciando verificación de notificaciones de conteo...');

    try {
      // Obtener configuraciones
      const configs = await this.conteoConfigRepository.find();

      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1; // 0-11 → 1-12
      const currentDay = today.getDate();

      for (const config of configs) {
        if (config.tipo === ConteoTipo.MENSUAL) {
          await this.checkMensualConteo(config, currentYear, currentMonth, currentDay);
        } else if (config.tipo === ConteoTipo.ANUAL) {
          await this.checkAnualConteo(config, currentYear, currentMonth, currentDay);
        }
      }

      this.logger.log('✅ Verificación de notificaciones completada');
    } catch (error) {
      this.logger.error('❌ Error en verificación de notificaciones:', error);
    }
  }

  /**
   * Verificar conteo mensual (10%)
   */
  private async checkMensualConteo(
    config: ConteoConfig,
    currentYear: number,
    currentMonth: number,
    currentDay: number,
  ) {
    // La fecha límite es el día X de cada mes
    const targetDay = config.dia;
    const diasAviso = config.diasAviso;

    // Calcular días restantes hasta la fecha límite de este mes
    const daysUntilTarget = targetDay - currentDay;

    this.logger.log(
      `📅 Conteo Mensual: Día objetivo ${targetDay}, Día actual ${currentDay}, Días restantes: ${daysUntilTarget}`,
    );

    // Verificar si ya se completó el conteo de este mes
    const completado = await this.conteoService.hasCompletedMensualConteo(
      currentYear,
      currentMonth,
    );

    if (completado) {
      this.logger.log(`✅ Conteo mensual ${currentMonth}/${currentYear} ya completado`);
      return;
    }

    // CASO 1: Fecha ya pasó (vencido)
    if (daysUntilTarget < 0) {
      this.logger.warn(`⚠️ Conteo mensual ${currentMonth}/${currentYear} VENCIDO`);

      const title = '⚠️ Conteo Mensual Pendiente';
      const message = `El conteo del 10% mensual debía realizarse el ${targetDay}/${currentMonth}/${currentYear}. Por favor, completar a la brevedad.`;

      await this.notificationService.createBroadcastNotification(
        NotificationType.CONTEO_MENSUAL_VENCIDO,
        title,
        message,
      );

      return;
    }

    // CASO 2: Se acerca la fecha (dentro del período de aviso)
    if (daysUntilTarget > 0 && daysUntilTarget <= diasAviso) {
      this.logger.log(`📅 Conteo mensual ${currentMonth}/${currentYear} próximo (${daysUntilTarget} días)`);

      const title = '📅 Recordatorio de Conteo Mensual';
      const message = `El conteo del 10% mensual debe realizarse el ${targetDay}/${currentMonth}/${currentYear}. Faltan ${daysUntilTarget} día(s).`;

      await this.notificationService.createBroadcastNotification(
        NotificationType.CONTEO_MENSUAL_PROXIMO,
        title,
        message,
      );

      return;
    }

    // CASO 3: Hoy es el día
    if (daysUntilTarget === 0) {
      this.logger.log(`📅 HOY es el día del conteo mensual ${currentMonth}/${currentYear}`);

      const title = '🔔 Conteo Mensual HOY';
      const message = `El conteo del 10% mensual debe realizarse HOY (${targetDay}/${currentMonth}/${currentYear}).`;

      await this.notificationService.createBroadcastNotification(
        NotificationType.CONTEO_MENSUAL_PROXIMO,
        title,
        message,
      );

      return;
    }

    // CASO 4: Aún falta mucho (más de diasAviso días)
    this.logger.log(`ℹ️ Conteo mensual ${currentMonth}/${currentYear} aún lejano (${daysUntilTarget} días)`);
  }

  /**
   * Verificar conteo anual (100%)
   */
  private async checkAnualConteo(
    config: ConteoConfig,
    currentYear: number,
    currentMonth: number,
    currentDay: number,
  ) {
    // La fecha límite es el día X del mes Y
    const targetMonth = config.mes;
    const targetDay = config.dia;
    const diasAviso = config.diasAviso;

    // Solo verificar si estamos en el mes objetivo o después
    if (currentMonth < targetMonth) {
      this.logger.log(`ℹ️ Conteo anual ${currentYear}: Aún no es el mes (${currentMonth} < ${targetMonth})`);
      return;
    }

    // Si ya pasamos del mes objetivo, verificar el año pasado
    if (currentMonth > targetMonth) {
      this.logger.log(`ℹ️ Conteo anual ${currentYear}: Ya pasó el mes objetivo`);
      // Aquí podrías verificar el año anterior si es necesario
      return;
    }

    // Estamos en el mes objetivo
    const daysUntilTarget = targetDay - currentDay;

    this.logger.log(
      `📅 Conteo Anual: Mes objetivo ${targetMonth}, Día objetivo ${targetDay}, Día actual ${currentDay}, Días restantes: ${daysUntilTarget}`,
    );

    // Verificar si ya se completó el conteo de este año
    const completado = await this.conteoService.hasCompletedAnualConteo(currentYear);

    if (completado) {
      this.logger.log(`✅ Conteo anual ${currentYear} ya completado`);
      return;
    }

    // CASO 1: Fecha ya pasó (vencido)
    if (daysUntilTarget < 0) {
      this.logger.warn(`⚠️ Conteo anual ${currentYear} VENCIDO`);

      const title = '⚠️ Conteo Anual Pendiente';
      const message = `El conteo del 100% anual debía realizarse el ${targetDay}/${targetMonth}/${currentYear}. Por favor, completar a la brevedad.`;

      await this.notificationService.createBroadcastNotification(
        NotificationType.CONTEO_ANUAL_VENCIDO,
        title,
        message,
      );

      return;
    }

    // CASO 2: Se acerca la fecha (dentro del período de aviso)
    if (daysUntilTarget > 0 && daysUntilTarget <= diasAviso) {
      this.logger.log(`📅 Conteo anual ${currentYear} próximo (${daysUntilTarget} días)`);

      const title = '📅 Recordatorio de Conteo Anual';
      const message = `El conteo del 100% anual debe realizarse el ${targetDay}/${targetMonth}/${currentYear}. Faltan ${daysUntilTarget} día(s).`;

      await this.notificationService.createBroadcastNotification(
        NotificationType.CONTEO_ANUAL_PROXIMO,
        title,
        message,
      );

      return;
    }

    // CASO 3: Hoy es el día
    if (daysUntilTarget === 0) {
      this.logger.log(`📅 HOY es el día del conteo anual ${currentYear}`);

      const title = '🔔 Conteo Anual HOY';
      const message = `El conteo del 100% anual debe realizarse HOY (${targetDay}/${targetMonth}/${currentYear}).`;

      await this.notificationService.createBroadcastNotification(
        NotificationType.CONTEO_ANUAL_PROXIMO,
        title,
        message,
      );

      return;
    }

    // CASO 4: Aún falta mucho
    this.logger.log(`ℹ️ Conteo anual ${currentYear} aún lejano (${daysUntilTarget} días)`);
  }

  /**
   * CRON JOB - Limpieza semanal de notificaciones antiguas
   * Se ejecuta todos los domingos a las 2:00 AM
   */
  @Cron('0 2 * * 0', {
    name: 'clean-old-notifications',
    timeZone: 'America/Havana',
  })
  async cleanOldNotifications() {
    this.logger.log('🧹 Iniciando limpieza de notificaciones antiguas...');

    try {
      await this.notificationService.cleanOldNotifications(30);
      this.logger.log('✅ Limpieza completada');
    } catch (error) {
      this.logger.error('❌ Error en limpieza:', error);
    }
  }
}