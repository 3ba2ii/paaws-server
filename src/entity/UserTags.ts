import { UserTagsType } from '../types/types';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';

@ObjectType()
@Entity()
export class UserTag extends BaseEntity {
  @PrimaryColumn()
  userId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.tags, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Field(() => UserTagsType)
  @PrimaryColumn({
    type: 'enum',
    enum: UserTagsType,
  })
  tagName!: UserTagsType;
}
//
