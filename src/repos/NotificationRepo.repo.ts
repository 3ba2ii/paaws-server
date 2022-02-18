import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import {
  NotificationType,
  NOTIFICATION_CONTENT_TYPES,
} from '../types/enums.types';
import { Notification } from './../entity/Notification/Notification';
import { MissingPost } from './../entity/PostEntities/MissingPost';
import { User } from './../entity/UserEntities/User';

interface CreateNotificationInput {
  performer: User;
  content: MissingPost | User;
  receiver?: User;
  notificationType: NotificationType;
  customMessage?: string;
  receiverId?: number;
}
@Service()
@EntityRepository(Notification)
export class NotificationRepo extends Repository<Notification> {
  /* 
  we have x types of notifications
  1. UPDOOT_NOTIFICATION -> someone has upvoted/downvoted a post or a comment -> post id
  2. COMMENT_NOTIFICATION -> someone has commented on a post -> post id 
  3. MISSING_PET_AROUND_NOTIFICATION -> someone has posted a post for a missing pet near you -> post id
  todo next 
    * 4. NEW_PET_NOTIFICATION -> someone has posted a post for a new pet near you -> post id
  */

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
      case NotificationType.REPLY_NOTIFICATION:
        return `${performer.full_name} replied on your comment`;
      case NotificationType.MISSING_PET_AROUND_YOU:
        return `${performer.full_name} posted that there is a missing pet near you, Help him finding it!`;
      default:
        return null;
    }
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await Notification.createQueryBuilder('notification')
      .where('notification."userId" = :userId', { userId })
      .leftJoinAndSelect('notification.user', 'user')
      .getMany();
  }
  /**
   * @param performer The user who triggered the action
   * @param content The content that was affected by the action
   * @param receiver The user who is receiving the notification
   * @param notificationType Either upvote, downvote, comment, reply, missing pet around you
   */
  async createNotification({
    performer,
    content,
    receiver,
    notificationType,
    customMessage,
    receiverId,
  }: CreateNotificationInput): Promise<Notification | null> {
    if (!receiverId && !receiver) {
      return null;
    }
    //1. check if the performer and receiver are the same -> if yes, return null
    if (performer.id === receiver?.id || performer.id === receiverId) {
      console.log(
        '❌ Performer is the same as receiver, so dont send a notification'
      );
      return null;
    }
    const full_message = this.getMessageForNotification(
      performer,
      content,
      notificationType
    );

    const contentType =
      content instanceof MissingPost
        ? NOTIFICATION_CONTENT_TYPES.POST
        : NOTIFICATION_CONTENT_TYPES.USER;

    if (!full_message) return null;

    let expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1); //expires in one month (will be used with a cron job to delete old seen notifications)

    let notificationData: Partial<Notification> = {
      contentId: content.id,
      message: customMessage ? customMessage : full_message,
      notificationType,
      contentType,
      expirationDate,
    };
    if (receiverId && typeof receiverId == 'number') {
      notificationData!.userId = receiverId;
    } else {
      notificationData!.user = receiver;
    }
    const notification = Notification.create({
      ...notificationData,
    });
    return notification.save();
  }
}
