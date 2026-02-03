// src/notification/notificacion.service.ts - VERSIÓN ACTUALIZADA CON EMAIL
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Notification, NotificationType } from './entities/notificacion.entity';
import { User } from '../user/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService, // 🆕 Inyectar EmailService
  ) {}

  /**
   * Crear notificación para un usuario específico
   * Ahora con envío de email automático
   */
  async createNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    sendEmail: boolean = true, // 🆕 Parámetro para controlar envío de email
  ): Promise<Notification> {
    // Crear notificación en BD
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // 🆕 Enviar email si está habilitado
    if (sendEmail) {
      await this.sendEmailNotification(userId, type, title, message);
    }

    return savedNotification;
  }

  /**
   * Crear notificación para TODOS los usuarios (broadcast)
   * Ahora con envío de email automático
   */
  async createBroadcastNotification(
    type: NotificationType,
    title: string,
    message: string,
    sendEmail: boolean = true, // 🆕 Parámetro para controlar envío de email
  ): Promise<Notification[]> {
    // Obtener todos los usuarios activos con preferencias de email
    const users = await this.userRepository.find({
      where: { active: true },
    });

    const notifications: Notification[] = [];

    for (const user of users) {
      // Verificar preferencias de email del usuario (si las tienes implementadas)
      const shouldSendEmail = sendEmail && this.shouldSendEmailToUser(user);

      const notification = await this.createNotification(
        user.id,
        type,
        title,
        message,
        shouldSendEmail,
      );
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * 🆕 Enviar email de notificación a un usuario
   */
  private async sendEmailNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user || !user.email) {
        return;
      }

      // Verificar si el usuario tiene emails habilitados
      if (!this.shouldSendEmailToUser(user)) {
        return;
      }

      await this.emailService.sendNotificationEmail(
        user.email,
        user.email,
        type,
        title,
        message,
      );
    } catch (error) {
      // Log del error pero no fallar la creación de la notificación
      console.error('Error enviando email de notificación:', error);
    }
  }

  /**
   * 🆕 Verificar si se debe enviar email a un usuario
   * Puedes extender esto para incluir preferencias de usuario
   */
  private shouldSendEmailToUser(user: User): boolean {
    // Por defecto, enviar a todos los usuarios activos
    // Puedes agregar lógica adicional aquí:
    // - user.emailNotificationsEnabled
    // - user.notificationPreferences
    // - etc.
    return user.active && !!user.email;
  }

  /**
   * 🆕 Enviar resumen diario de notificaciones no leídas por email
   */
  async sendDailyDigest(userId?: number): Promise<void> {
    try {
      let users: User[];

      if (userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        users = user ? [user] : [];
      } else {
        users = await this.userRepository.find({ where: { active: true } });
      }

      for (const user of users) {
        const unreadNotifications = await this.getNotifications(user.id, true, 50);

        if (unreadNotifications.length === 0) {
          continue; // No enviar si no hay notificaciones pendientes
        }

        const notificationsData = unreadNotifications.map((n) => ({
          type: n.type,
          title: n.title,
          message: n.message,
        }));

        await this.emailService.sendDailyDigest(
          user.email,
          user.email,
          notificationsData,
        );
      }
    } catch (error) {
      console.error('Error enviando resumen diario:', error);
    }
  }

  /**
   * Verificar si ya existe una notificación del mismo tipo para el usuario en las últimas 24 horas
   * (Para evitar spam de notificaciones duplicadas)
   */
  async notificationExistsRecently(
    userId: number,
    type: NotificationType,
    hoursWindow: number = 24,
  ): Promise<boolean> {
    const windowDate = new Date();
    windowDate.setHours(windowDate.getHours() - hoursWindow);

    const count = await this.notificationRepository.count({
      where: {
        userId,
        type,
        createdAt: MoreThan(windowDate),
      },
    });

    return count > 0;
  }

  /**
   * Obtener notificaciones de un usuario
   */
  async getNotifications(
    userId: number,
    unreadOnly: boolean = false,
    limit: number = 50,
  ): Promise<Notification[]> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .limit(limit);

    if (unreadOnly) {
      query.andWhere('notification.read = :read', { read: false });
    }

    return await query.getMany();
  }

  /**
   * Contar notificaciones no leídas
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('Notificación no encontrada');
    }

    notification.read = true;
    notification.readAt = new Date();

    return await this.notificationRepository.save(notification);
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where('userId = :userId', { userId })
      .andWhere('read = :read', { read: false })
      .execute();
  }

  /**
   * Eliminar notificaciones antiguas (limpieza)
   * Por ejemplo, eliminar notificaciones leídas de más de 30 días
   */
  async cleanOldNotifications(daysOld: number = 30): Promise<void> {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - daysOld);

    await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('read = :read', { read: true })
      .andWhere('readAt < :oldDate', { oldDate })
      .execute();
  }
}