import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Notification, NotificationType } from './entities/notificacion.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async createNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    sendEmail: boolean = true,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    if (sendEmail) {
      await this.sendEmailNotification(userId, type, title, message);
    }

    return savedNotification;
  }

  async createBroadcastNotification(
    type: NotificationType,
    title: string,
    message: string,
    sendEmail: boolean = true,
  ): Promise<Notification[]> {
    const users = await this.userRepository.find({
      where: { active: true },
    });

    const notifications: Notification[] = [];

    for (const user of users) {
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

  async notifyAdminsNewUserPending(
    userId: number,
    userName: string,
    userEmail: string,
  ): Promise<void> {
    const admins = await this.userRepository.find({
      where: {
        role: UserRole.ADMIN,
        active: true,
      },
    });

    const title = '👤 Nuevo Usuario Pendiente de Aprobación';
    const message = `${userName} (${userEmail}) ha completado el registro y está esperando aprobación.`;

    for (const admin of admins) {
      await this.createNotification(
        admin.id,
        NotificationType.GENERAL,
        title,
        message,
        true,
      );
    }
  }

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

      if (!this.shouldSendEmailToUser(user)) {
        return;
      }

      await this.emailService.sendNotificationEmail(
        user.email,
        user.name,
        type,
        title,
        message,
      );
    } catch (error) {
      return;
    }
  }

  private shouldSendEmailToUser(user: User): boolean {
    return user.active && !!user.email;
  }

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
          continue;
        }

        const notificationsData = unreadNotifications.map((n) => ({
          type: n.type,
          title: n.title,
          message: n.message,
        }));

        await this.emailService.sendDailyDigest(
          user.email,
          user.name,
          notificationsData,
        );
      }
    } catch (error) {
      return;
    }
  }

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

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        userId,
        read: false,
      },
    });
  }

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