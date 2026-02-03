// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { NotificationType } from '../notificacion/entities/notificacion.entity';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailEnabled = this.configService.get<boolean>('EMAIL_ENABLED', false);

    // 🆕 LOG TEMPORAL PARA DEBUG
    console.log('📧 EMAIL CONFIG:', {
      enabled: emailEnabled,
      service: this.configService.get<string>('EMAIL_SERVICE'),
      user: this.configService.get<string>('EMAIL_USER'),
      from: this.configService.get<string>('EMAIL_FROM'),
      passwordLength: this.configService.get<string>('EMAIL_PASSWORD')?.length,
      hasPassword: !!this.configService.get<string>('EMAIL_PASSWORD'),
    });

    if (!emailEnabled) {
      this.logger.warn('Email está deshabilitado en la configuración');
      return;
    }

    const emailService = this.configService.get<string>('EMAIL_SERVICE');
    
    if (emailService === 'gmail') {
      // Configuración para Gmail
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.configService.get<string>('EMAIL_USER'),
          pass: this.configService.get<string>('EMAIL_PASSWORD'),
        },
      });
      
      // 🆕 LOG PARA CONFIRMAR CREACIÓN
      console.log('✅ Transporter de Gmail creado');
    } else {
      // Configuración SMTP genérica
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('EMAIL_HOST'),
        port: this.configService.get<number>('EMAIL_PORT', 587),
        secure: this.configService.get<boolean>('EMAIL_SECURE', false),
        auth: {
          user: this.configService.get<string>('EMAIL_USER'),
          pass: this.configService.get<string>('EMAIL_PASSWORD'),
        },
      });
      
      // 🆕 LOG PARA CONFIRMAR CREACIÓN
      console.log('✅ Transporter SMTP creado');
    }

    this.logger.log('Transporter de email inicializado correctamente');
  }

  /**
   * Verificar conexión del transporter
   */
  async verifyConnection(): Promise<boolean> {
    console.log('🔍 Verificando conexión...'); // 🆕

    if (!this.transporter) {
      console.log('❌ Transporter no existe'); // 🆕
      this.logger.warn('Transporter no inicializado');
      return false;
    }

    try {
      console.log('⏳ Intentando verificar con Gmail...'); // 🆕
      await this.transporter.verify();
      console.log('✅ Conexión verificada exitosamente'); // 🆕
      this.logger.log('Conexión de email verificada exitosamente');
      return true;
    } catch (error) {
      console.log('❌ Error en verificación:', error.message); // 🆕
      this.logger.error('Error verificando conexión de email:', error);
      return false;
    }
  }

  // ... resto del código sin cambios
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Transporter no inicializado, email no enviado');
      return false;
    }

    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@sistema.com'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email enviado exitosamente a ${options.to} - ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email a ${options.to}:`, error);
      return false;
    }
  }

  async sendNotificationEmail(
    to: string,
    userName: string,
    type: NotificationType,
    title: string,
    message: string,
  ): Promise<boolean> {
    const html = this.getNotificationTemplate(userName, type, title, message);
    const subject = this.getEmailSubject(type, title);

    return this.sendEmail({
      to,
      subject,
      html,
    });
  }

  private getEmailSubject(type: NotificationType, title: string): string {
    const prefix = {
      [NotificationType.GENERAL]: '📢',
      [NotificationType.CONTEO_MENSUAL_PROXIMO]: '⚠️',
      [NotificationType.CONTEO_MENSUAL_VENCIDO]: '🚨',
    };

    return `${prefix[type] || '📬'} ${title}`;
  }

  private getNotificationTemplate(
    userName: string,
    type: NotificationType,
    title: string,
    message: string,
  ): string {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const appName = this.configService.get<string>('APP_NAME', 'Sistema de Gestión');
    
    const colors = {
      [NotificationType.GENERAL]: {
        primary: '#3B82F6',
        background: '#EFF6FF',
        border: '#BFDBFE',
      },
      [NotificationType.CONTEO_MENSUAL_PROXIMO]: {
        primary: '#F59E0B',
        background: '#FEF3C7',
        border: '#FDE68A',
      },
      [NotificationType.CONTEO_MENSUAL_VENCIDO]: {
        primary: '#EF4444',
        background: '#FEE2E2',
        border: '#FECACA',
      },
    };

    const color = colors[type] || colors[NotificationType.GENERAL];

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      background-color: #F3F4F6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: ${color.primary};
      color: white;
      padding: 30px 40px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 18px;
      color: #111827;
      margin-bottom: 20px;
    }
    .notification-box {
      background-color: ${color.background};
      border-left: 4px solid ${color.primary};
      padding: 20px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .notification-title {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 10px 0;
    }
    .notification-message {
      font-size: 16px;
      color: #4B5563;
      margin: 0;
      white-space: pre-wrap;
    }
    .cta-button {
      display: inline-block;
      background-color: ${color.primary};
      color: white;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 20px;
      transition: background-color 0.3s;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #F9FAFB;
      padding: 30px 40px;
      text-align: center;
      font-size: 14px;
      color: #6B7280;
      border-top: 1px solid #E5E7EB;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: ${color.primary};
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #E5E7EB;
      margin: 30px 0;
    }
    .info-text {
      font-size: 14px;
      color: #6B7280;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
    </div>
    <div class="content">
      <p class="greeting">Hola <strong>${userName}</strong>,</p>
      <p>Tienes una nueva notificación:</p>
      <div class="notification-box">
        <h2 class="notification-title">${title}</h2>
        <p class="notification-message">${message}</p>
      </div>
      <div style="text-align: center;">
        <a href="${appUrl}/notifications" class="cta-button">Ver en el sistema</a>
      </div>
      <p class="info-text">
        Esta notificación también está disponible en tu panel de notificaciones dentro del sistema.
      </p>
    </div>
    <div class="footer">
      <p><strong>${appName}</strong></p>
      <p>Este es un correo automático, por favor no responder.</p>
      <p>Si tienes alguna pregunta, contacta al <a href="mailto:soporte@sistema.com">equipo de soporte</a>.</p>
      <div class="divider"></div>
      <p style="font-size: 12px; color: #9CA3AF;">
        © ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  async sendDailyDigest(
    to: string,
    userName: string,
    notifications: Array<{ type: NotificationType; title: string; message: string }>,
  ): Promise<boolean> {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const appName = this.configService.get<string>('APP_NAME', 'Sistema de Gestión');

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumen de Notificaciones</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background: white; }
    .header { background: #3B82F6; color: white; padding: 30px; text-align: center; }
    .content { padding: 40px; }
    .notification-item { padding: 15px; margin: 10px 0; border-left: 3px solid #3B82F6; background: #F3F4F6; }
    .footer { padding: 30px; text-align: center; color: #6B7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 Resumen Diario de Notificaciones</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${userName}</strong>,</p>
      <p>Tienes <strong>${notifications.length}</strong> notificación(es) pendiente(s):</p>
      
      ${notifications
        .map(
          (notif) => `
        <div class="notification-item">
          <strong>${notif.title}</strong><br>
          <span style="color: #6B7280;">${notif.message}</span>
        </div>
      `,
        )
        .join('')}
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${appUrl}/notifications" 
           style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Ver todas las notificaciones
        </a>
      </div>
    </div>
    <div class="footer">
      <p>${appName} © ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject: `📬 Tienes ${notifications.length} notificación(es) pendiente(s)`,
      html,
    });
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: '🧪 Email de Prueba - Sistema de Notificaciones',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Email de Prueba</h2>
          <p>Si recibes este email, significa que el sistema de notificaciones por correo está funcionando correctamente.</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        </div>
      `,
    });
  }
}