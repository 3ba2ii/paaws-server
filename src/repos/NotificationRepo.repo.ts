import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../entity/PostEntities/Post';
import { NotificationType, NOTIFICATION_CONTENT_TYPES } from '../types/types';
import { Notification } from './../entity/Notification/Notification';
import { User } from './../entity/UserEntities/User';

@Service()
@EntityRepository(Notification)
export class NotificationRepo extends Repository<Notification> {
  //Method we need here
  createNotificationForUpdoot(
    content: Post | User,
    message: string,
    user: User
  ): Promise<Notification> {
    const contentType =
      content instanceof Post
        ? NOTIFICATION_CONTENT_TYPES.POST
        : NOTIFICATION_CONTENT_TYPES.USER;

    const notification = Notification.create({
      contentId: content.id,
      message,
      user,
      contentType,
      notificationType: NotificationType.UPDOOT_NOTIFICATION,
    });
    return notification.save();
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await this.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .getMany();
  }
  async createNotification(
    content: Post | User,
    message: string,
    user: User,
    notificationType: NotificationType
  ): Promise<Notification> {
    const notification = Notification.create({
      contentId: content.id,
      message,
      user,
      notificationType,
    });
    return await notification.save();
  }
}
