import { ObjectType } from 'type-graphql';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Comment } from './Comment';
import { Updoot } from './Updoot';

@ObjectType()
@Entity()
export class CommentUpdoot extends Updoot {
  @PrimaryColumn()
  commentId: number;

  @ManyToOne(() => Comment, (comment) => comment.updoots, {
    onDelete: 'CASCADE',
  })
  comment: Comment;
}
