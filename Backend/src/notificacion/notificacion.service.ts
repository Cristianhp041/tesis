import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Notification, NotificationType } from './entities/notificacion.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crear notificación para un usuario específico
   */
  async createNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
    });

    return await this.notificationRepository.save(notification);
  }

  /**
   * Crear notificación para TODOS los usuarios (broadcast)
   */
  async createBroadcastNotification(
    type: NotificationType,
    title: string,
    message: string,
  ): Promise<Notification[]> {
    // Obtener todos los usuarios activos
    const users = await this.userRepository.find({
      where: { active: true },
    });

    const notifications: Notification[] = [];

    for (const user of users) {
      const notification = await this.createNotification(
        user.id,
        type,
        title,
        message,
      );
      notifications.push(notification);
    }

    return notifications;
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