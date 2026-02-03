// src/notification/notificacion.scheduler.ts - VERSIÓN ACTUALIZADA
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from './notificacion.service';
import { ConteoService } from './conteo.service';
import { NotificationType } from './entities/notificacion.entity';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);
  private notificacionesEnviadas = new Set<string>();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly conteoService: ConteoService,
  ) {}

  /**
   * Verificar y enviar notificaciones de conteo mensual
   * Se ejecuta todos los días a las 8:00 AM
   */
  @Cron('0 8 * * *', {
    name: 'check-conteo-notifications',
    timeZone: 'America/Havana',
  })
  async handleConteoNotifications() {
    this.logger.log('Verificando notificaciones de conteo mensual...');

    try {
      const mesesSinConfirmar = await this.conteoService.obtenerMesesSinConfirmar();

      for (const mes of mesesSinConfirmar) {
        const diasRestantes = this.conteoService.calcularDiasRestantes(mes.fechaLimite);
        
        await this.procesarNotificacionMes(mes, diasRestantes);
      }

      this.limpiarNotificacionesAntiguasDiarias();
    } catch (error) {
      this.logger.error('Error en verificación de notificaciones:', error);
    }
  }

  private async procesarNotificacionMes(mes: any, diasRestantes: number) {
    const key = `${mes.id}-${diasRestantes}`;
    
    if (this.notificacionesEnviadas.has(key)) {
      return;
    }

    let debeNotificar = false;
    let title = '';
    let message = '';
    let type: NotificationType = NotificationType.CONTEO_MENSUAL_PROXIMO;

    if (diasRestantes === 7) {
      debeNotificar = true;
      title = '📅 Recordatorio: Conteo Mensual en 7 días';
      message = `El conteo del 10% mensual (${mes.nombreMes} ${mes.anno}) debe confirmarse en 7 días. Fecha límite: ${new Date(mes.fechaLimite).toLocaleDateString('es-ES')}.`;
    } else if (diasRestantes === 3) {
      debeNotificar = true;
      title = '⚠️ Recordatorio: Conteo Mensual en 3 días';
      message = `El conteo del 10% mensual (${mes.nombreMes} ${mes.anno}) debe confirmarse en 3 días. Fecha límite: ${new Date(mes.fechaLimite).toLocaleDateString('es-ES')}.`;
    } else if (diasRestantes === 1) {
      debeNotificar = true;
      title = '🔔 Urgente: Conteo Mensual MAÑANA';
      message = `El conteo del 10% mensual (${mes.nombreMes} ${mes.anno}) debe confirmarse MAÑANA. Fecha límite: ${new Date(mes.fechaLimite).toLocaleDateString('es-ES')}.`;
    } else if (diasRestantes === 0) {
      debeNotificar = true;
      title = '🚨 ÚLTIMO DÍA: Conteo Mensual HOY';
      message = `HOY es el último día para confirmar el conteo del 10% mensual (${mes.nombreMes} ${mes.anno}). Fecha límite: ${new Date(mes.fechaLimite).toLocaleDateString('es-ES')}.`;
    } else if (diasRestantes < 0) {
      debeNotificar = true;
      type = NotificationType.CONTEO_MENSUAL_VENCIDO;
      title = '❌ Conteo Mensual VENCIDO';
      message = `El conteo del 10% mensual (${mes.nombreMes} ${mes.anno}) NO fue confirmado. La fecha límite era: ${new Date(mes.fechaLimite).toLocaleDateString('es-ES')}. Por favor, completar a la brevedad.`;
    }

    if (debeNotificar) {
      // 🆕 El parámetro sendEmail=true enviará emails automáticamente
      await this.notificationService.createBroadcastNotification(
        type,
        title,
        message,
        true, // 🆕 Enviar email
      );
      
      this.notificacionesEnviadas.add(key);
    }
  }

  private limpiarNotificacionesAntiguasDiarias() {
    const ahora = new Date();
    if (ahora.getHours() === 0) {
      this.notificacionesEnviadas.clear();
    }
  }

  /**
   * Limpieza de notificaciones antiguas
   * Se ejecuta todos los domingos a las 2:00 AM
   */
  @Cron('0 2 * * 0', {
    name: 'clean-old-notifications',
    timeZone: 'America/Havana',
  })
  async cleanOldNotifications() {
    this.logger.log('Limpiando notificaciones antiguas...');

    try {
      await this.notificationService.cleanOldNotifications(30);
    } catch (error) {
      this.logger.error('Error en limpieza:', error);
    }
  }

  /**
   * 🆕 Enviar resumen diario de notificaciones por email
   * Se ejecuta todos los días a las 9:00 AM
   */
  @Cron('0 9 * * *', {
    name: 'send-daily-digest',
    timeZone: 'America/Havana',
  })
  async sendDailyDigest() {
    this.logger.log('Enviando resumen diario de notificaciones...');

    try {
      await this.notificationService.sendDailyDigest();
      this.logger.log('Resumen diario enviado exitosamente');
    } catch (error) {
      this.logger.error('Error enviando resumen diario:', error);
    }
  }
}