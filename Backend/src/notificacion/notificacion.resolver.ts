import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationService } from './notificacion.service';
import { Notification } from './entities/notificacion.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => Notification)
@UseGuards(JwtAuthGuard)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Query: Obtener mis notificaciones
   */
  @Query(() => [Notification])
  async myNotifications(
    @Context() context: any,
    @Args('unreadOnly', { type: () => Boolean, nullable: true }) unreadOnly?: boolean,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<Notification[]> {
    const userId = context.req.user.sub;
    return this.notificationService.getNotifications(
      userId,
      unreadOnly ?? false,
      limit ?? 50,
    );
  }

  /**
   * Query: Contar notificaciones no leídas
   */
  @Query(() => Int)
  async unreadNotificationsCount(@Context() context: any): Promise<number> {
    const userId = context.req.user.sub;
    return this.notificationService.getUnreadCount(userId);
  }

  /**
   * Mutation: Marcar notificación como leída
   */
  @Mutation(() => Notification)
  async markNotificationAsRead(
    @Context() context: any,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Notification> {
    const userId = context.req.user.sub;
    return this.notificationService.markAsRead(id, userId);
  }

  /**
   * Mutation: Marcar todas las notificaciones como leídas
   */
  @Mutation(() => Boolean)
  async markAllNotificationsAsRead(@Context() context: any): Promise<boolean> {
    const userId = context.req.user.sub;
    await this.notificationService.markAllAsRead(userId);
    return true;
  }
}