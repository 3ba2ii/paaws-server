import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { NotificationType, NOTIFICATION_CONTENT_TYPES } from '../types/types';
import { Notification } from './../entity/Notification/Notification';
import { MissingPost } from './../entity/PostEntities/MissingPost';
import { User } from './../entity/UserEntities/User';

@Service()
@EntityRepository(Notification)
export class NotificationRepo extends Repository<Notification> {
  //Method we need here
  //1. Get all notifications for a user
  //2. Get all notifications for a user and filter them by type
  //3. create a notification for a user

  /* 
  we have x types of notifications
  1. UPDOOT_NOTIFICATION -> someone has upvoted/downvoted a post or a comment -> post id
  2. COMMENT_NOTIFICATION -> someone has commented on a post -> post id 
  3. MISSING_PET_AROUND_NOTIFICATION -> someone has posted a post for a missing pet near you -> post id
  todo next 
    * 4. NEW_PET_FOUND_NOTIFICATION -> someone has posted a post for a new pet near you -> post id

  */

  //todo: create a method that returns message for the notification based on its type
  private getMessageForNotification(
    performer: User,
    content: MissingPost | User,
    notificationType: NotificationType
  ): string | null {
    const contentType = content instanceof MissingPost ? 'post' : 'user';

    switch (notificationType) {
      case NotificationType.UPVOTE:
        return `${performer.full_name} upvoted your ${contentType}`;
      case NotificationType.DOWNVOTE:
        return `${performer.full_name} downvoted your ${contentType}`;
      case NotificationType.COMMENT_NOTIFICATION:
        return `${performer.full_name} commented on your ${contentType}`;
      case NotificationType.MISSING_PET_AROUND_YOU:
        return `${performer.full_name} posted that there is a missing pet near you, Help him find it!`;
      default:
        return null;
    }
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await Notification.createQueryBuilder('notification')
      .where('notification."userId" = :userId', { userId })
      .getMany();
  }
  async createNotification(
    performer: User,
    content: MissingPost | User,
    receiver: User,
    notificationType: NotificationType
  ): Promise<Notification | null> {
    //todo: check if the notification already exists
    const full_message = this.getMessageForNotification(
      performer,
      content,
      notificationType
    );

    const contentType =
      content instanceof MissingPost
        ? NOTIFICATION_CONTENT_TYPES.POST
        : NOTIFICATION_CONTENT_TYPES.USER;

    if (full_message == null) {
      return null;
    }
    let expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);

    const notification = Notification.create({
      contentId: content.id,
      message: full_message,
      user: receiver,
      notificationType,
      contentType,
      expirationDate,
    });
    return await notification.save();
  }
}
