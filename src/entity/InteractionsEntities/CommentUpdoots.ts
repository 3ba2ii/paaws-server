import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../UserEntities/User';
import { Comment } from './Comment';

@ObjectType()
@Entity()
export class CommentUpdoot extends BaseEntity {
  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.updoots)
  user: User;

  @PrimaryColumn()
  commentId: number;

  @ManyToOne(() => Comment, (comment) => comment.updoots, {
    onDelete: 'CASCADE',
  })
  comment: Comment;

  @Field(() => Int)
  @Column({ type: 'int' })
  value: number; //1 or -1
}
