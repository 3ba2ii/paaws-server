import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, ManyToOne } from 'typeorm';
import { EntityWithBase, EntityWithDates } from '../../utils/class-mixins';
import { User } from '../UserEntities/User';

@ObjectType()
export abstract class Metadata extends EntityWithDates(
  EntityWithBase(BaseEntity)
) {
  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User) //this is the receiver not the creator
  @ManyToOne(() => User, (user) => user.metadata)
  user: User;

  @Field()
  @Column()
  value: string;
}
