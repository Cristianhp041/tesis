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
    const emailEnabled = this.configService.get<string>('EMAIL_ENABLED');
    const emailService = this.configService.get<string>('EMAIL_SERVICE');
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');

    if (emailEnabled !== 'true') {
      this.logger.warn('Email está deshabilitado en la configuración');
      return;
    }

    try {
      if (emailService === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        });
      } else {
        this.transporter = nodemailer.createTransport({
          host: this.configService.get<string>('EMAIL_HOST'),
          port: this.configService.get<number>('EMAIL_PORT', 587),
          secure: this.configService.get<boolean>('EMAIL_SECURE', false),
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        });
      }

      this.logger.log('Transporter de email inicializado correctamente');
    } catch (error) {
      this.logger.error('Error inicializando transporter:', error);
    }
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Transporter no inicializado');
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('Conexión de email verificada exitosamente');
      return true;
    } catch (error) {
      this.logger.error('Error verificando conexión de email:', error);
      return false;
    }
  }

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

  async sendVerificationCode(to: string, userName: string, code: string): Promise<boolean> {
    const appName = this.configService.get<string>('APP_NAME', 'Sistema de Gestión');
    
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .code-box { background: #f0f7ff; border: 2px dashed #3b82f6; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; }
    .code { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 5px; font-family: monospace; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="color: #111827; margin-bottom: 20px;">🔐 Verifica tu Email</h1>
    
    <p>Hola <strong>${userName}</strong>,</p>
    
    <p>Gracias por registrarte en <strong>${appName}</strong>.</p>
    
    <p>Para completar tu registro y verificar tu email, usa el siguiente código:</p>
    
    <div class="code-box">
      <div class="code">${code}</div>
    </div>
    
    <p><strong>Importante:</strong> Este código es válido por <strong>24 horas</strong>.</p>
    
    <p>Una vez verificado tu email, un administrador revisará y aprobará tu cuenta.</p>
    
    <p>Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
    
    <div class="footer">
      <p><strong>${appName}</strong></p>
      <p>Este es un correo automático, por favor no responder.</p>
      <p style="font-size: 12px; color: #9ca3af;">© ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;
    
    return await this.sendEmail({
      to,
      subject: `🔐 Código de Verificación - ${appName}`,
      html,
    });
  }

  async sendApprovalEmail(to: string, userName: string, approved: boolean, reason?: string): Promise<boolean> {
    const appName = this.configService.get<string>('APP_NAME', 'Sistema de Gestión');
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    
    const html = approved
      ? `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .success-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="color: #111827; margin-bottom: 20px;">✅ ¡Cuenta Aprobada!</h1>
    
    <p>Hola <strong>${userName}</strong>,</p>
    
    <div class="success-box">
      <p style="margin: 0; color: #166534; font-weight: 600;">
        ¡Excelentes noticias! Tu cuenta ha sido aprobada por el administrador.
      </p>
    </div>
    
    <p>Ya puedes iniciar sesión en el sistema con tu email y contraseña.</p>
    
    <div style="text-align: center;">
      <a href="${appUrl}/login" class="button">Iniciar Sesión</a>
    </div>
    
    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
    
    <div class="footer">
      <p><strong>${appName}</strong></p>
      <p>Este es un correo automático, por favor no responder.</p>
      <p style="font-size: 12px; color: #9ca3af;">© ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
      `
      : `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .error-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .reason-box { background: #f9fafb; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="color: #111827; margin-bottom: 20px;">❌ Solicitud de Registro No Aprobada</h1>
    
    <p>Hola <strong>${userName}</strong>,</p>
    
    <div class="error-box">
      <p style="margin: 0; color: #991b1b; font-weight: 600;">
        Lamentablemente, tu solicitud de registro no ha sido aprobada.
      </p>
    </div>
    
    ${reason ? `
    <div class="reason-box">
      <p style="margin: 0; color: #374151;">
        <strong>Motivo:</strong> ${reason}
      </p>
    </div>
    ` : ''}
    
    <p>Si crees que esto es un error, por favor contacta con el administrador del sistema.</p>
    
    <div class="footer">
      <p><strong>${appName}</strong></p>
      <p>Este es un correo automático, por favor no responder.</p>
      <p style="font-size: 12px; color: #9ca3af;">© ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
      `;
    
    return await this.sendEmail({
      to,
      subject: approved 
        ? `✅ Cuenta Aprobada - ${appName}` 
        : `❌ Solicitud de Registro - ${appName}`,
      html,
    });
  }

  async sendPasswordResetCode(to: string, userName: string, code: string): Promise<boolean> {
    const appName = this.configService.get<string>('APP_NAME', 'Sistema de Gestión');
    
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .code-box { background: #fef3c7; border: 2px dashed #f59e0b; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; }
    .code { font-size: 32px; font-weight: bold; color: #f59e0b; letter-spacing: 5px; font-family: monospace; }
    .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="color: #111827; margin-bottom: 20px;">🔑 Recuperación de Contraseña</h1>
    
    <p>Hola <strong>${userName}</strong>,</p>
    
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
    
    <p>Usa el siguiente código para crear una nueva contraseña:</p>
    
    <div class="code-box">
      <div class="code">${code}</div>
    </div>
    
    <div class="warning">
      <strong>⚠️ Importante:</strong>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Este código es válido por <strong>1 hora</strong></li>
        <li>Solo puedes usarlo <strong>una vez</strong></li>
        <li>No compartas este código con nadie</li>
      </ul>
    </div>
    
    <p><strong>¿No solicitaste esto?</strong></p>
    <p>Si no fuiste tú, ignora este mensaje.</p>
    
    <div class="footer">
      <p><strong>${appName}</strong></p>
      <p>Este es un correo automático, por favor no responder.</p>
      <p style="font-size: 12px; color: #9ca3af;">© ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;
    
    return await this.sendEmail({
      to,
      subject: `🔑 Código de Recuperación - ${appName}`,
      html,
    });
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
    const prefix: Record<string, string> = {
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
    
    const colors: Record<string, { primary: string; background: string; border: string }> = {
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
  <style>
    body { font-family: Arial, sans-serif; background-color: #F3F4F6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background-color: ${color.primary}; color: white; padding: 30px 40px; text-align: center; }
    .content { padding: 40px; }
    .notification-box { background-color: ${color.background}; border-left: 4px solid ${color.primary}; padding: 20px; border-radius: 4px; margin: 20px 0; }
    .footer { background-color: #F9FAFB; padding: 30px 40px; text-align: center; font-size: 14px; color: #6B7280; border-top: 1px solid #E5E7EB; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">${appName}</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${userName}</strong>,</p>
      <div class="notification-box">
        <h2 style="margin: 0 0 10px 0; color: #111827;">${title}</h2>
        <p style="margin: 0; color: #4B5563;">${message}</p>
      </div>
    </div>
    <div class="footer">
      <p><strong>${appName}</strong></p>
      <p style="font-size: 12px; color: #9CA3AF;">© ${new Date().getFullYear()} ${appName}</p>
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
  <style>
    body { font-family: Arial, sans-serif; }
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
      <h1>📬 Resumen Diario</h1>
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
      subject: '🧪 Email de Prueba',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Email de Prueba</h2>
          <p>El sistema de emails está funcionando correctamente.</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        </div>
      `,
    });
  }
}