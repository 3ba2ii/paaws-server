import { Field, Int, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';
import { INotification } from '.';
import { NotificationType } from '../../types/types';
import { NOTIFICATION_CONTENT_TYPES } from './../../types/types';

@ObjectType()
@Entity()
export class Notification extends INotification {
  @Field(() => NotificationType)
  @Column({ type: 'enum', enum: NotificationType })
  notificationType: NotificationType;

  @Field(() => NOTIFICATION_CONTENT_TYPES)
  @Column({ type: 'enum', enum: NOTIFICATION_CONTENT_TYPES })
  contentType: NOTIFICATION_CONTENT_TYPES;

  @Field(() => Int, {
    description:
      'ID of post, comment or any table that will specified on contentType Column',
  })
  @Column()
  contentId: number;
}
