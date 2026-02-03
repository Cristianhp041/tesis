// src/email/email-test.controller.ts
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { NotificationService } from '../notificacion/notificacion.service';
import { NotificationType } from '../notificacion/entities/notificacion.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';


@Controller('email/test')
@UseGuards(JwtAuthGuard)
export class EmailTestController {
  constructor(
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('verify')
  async verifyConnection() {
    const isConnected = await this.emailService.verifyConnection();
    return {
      success: isConnected,
      message: isConnected
        ? 'Conexión de email verificada exitosamente'
        : 'Error en la conexión de email',
    };
  }

  /**
   * Enviar email de prueba al usuario actual
   * POST /email/test/send-test
   */
  @Post('send-test')
  async sendTestEmail(@CurrentUser() user: any) {
    const sent = await this.emailService.sendTestEmail(user.email);
    return {
      success: sent,
      message: sent
        ? `Email de prueba enviado a ${user.email}`
        : 'Error enviando email de prueba',
      recipient: user.email,
    };
  }

  /**
   * Enviar notificación con email al usuario actual
   * POST /email/test/send-notification
   */
  @Post('send-notification')
  async sendNotificationEmail(
    @CurrentUser() user: any,
    @Body() body: { type?: NotificationType; title?: string; message?: string },
  ) {
    const type = body.type || NotificationType.GENERAL;
    const title = body.title || '🧪 Notificación de Prueba';
    const message =
      body.message || 'Esta es una notificación de prueba con email habilitado.';

    const notification = await this.notificationService.createNotification(
      user.sub,
      type,
      title,
      message,
      true, // Enviar email
    );

    return {
      success: true,
      message: 'Notificación creada y email enviado',
      notification,
    };
  }

  /**
   * Enviar resumen diario al usuario actual
   * POST /email/test/send-digest
   */
  @Post('send-digest')
  async sendDailyDigest(@CurrentUser() user: any) {
    await this.notificationService.sendDailyDigest(user.sub);
    return {
      success: true,
      message: `Resumen diario enviado a ${user.email}`,
    };
  }

  /**
   * Enviar notificación personalizada a un email específico
   * POST /email/test/send-custom
   */
  @Post('send-custom')
  async sendCustomEmail(
    @Body()
    body: {
      to: string;
      type: NotificationType;
      title: string;
      message: string;
    },
  ) {
    const sent = await this.emailService.sendNotificationEmail(
      body.to,
      'Usuario',
      body.type,
      body.title,
      body.message,
    );

    return {
      success: sent,
      message: sent ? `Email enviado a ${body.to}` : 'Error enviando email',
      recipient: body.to,
    };
  }

  /**
   * Obtener configuración actual de email
   * GET /email/test/config
   */
  @Get('config')
  async getEmailConfig() {
    return {
      enabled: process.env.EMAIL_ENABLED === 'true',
      service: process.env.EMAIL_SERVICE,
      from: process.env.EMAIL_FROM,
      user: process.env.EMAIL_USER,
      // NO exponer el password
    };
  }
}