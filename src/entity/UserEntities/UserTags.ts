import { User } from './User';
import { UserTagsType } from '../../types/types';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

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
