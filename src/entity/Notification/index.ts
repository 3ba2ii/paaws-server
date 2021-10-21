import { EntityWithBase, EntityWithDates } from '../../utils/class-mixins';
import { Field, ObjectType, Int } from 'type-graphql';
import { BaseEntity, Column, ManyToOne } from 'typeorm';
import { User } from '../UserEntities/User';

@ObjectType()
export abstract class INotification extends EntityWithDates(
  EntityWithBase(BaseEntity)
) {
  @Field()
  @Column({ default: false })
  isRead: boolean = false;

  @Field()
  @Column()
  message: string;

  @Field(() => Date)
  @Column()
  expirationDate: Date;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User) //this is the receiver not the creator
  @ManyToOne(() => User, (user) => user.notifications)
  user: User;
}
