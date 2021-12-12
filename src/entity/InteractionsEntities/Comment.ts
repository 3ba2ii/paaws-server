import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { EntityWithBase, EntityWithDates } from '../../utils/class-mixins';
import { MissingPost } from './../PostEntities/MissingPost';
import { User } from './../UserEntities/User';
import { CommentUpdoot } from './CommentUpdoots';

@ObjectType()
@Entity()
export class Comment extends EntityWithDates(EntityWithBase(BaseEntity)) {
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  parentId: number; //if it is null then it is a root comment else it is a reply

  @Field(() => Int)
  @Column({ default: 0 })
  repliesCount: number; //number of replies

  @Field()
  @Column()
  text: string;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @Field(() => Int)
  @Column()
  postId: number;

  @ManyToOne(() => MissingPost, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  post: MissingPost;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  points: number;

  @Field(() => Boolean)
  @Column({ default: false })
  isEdited: boolean;

  @Field(() => Boolean)
  isReply: boolean;

  @Field(() => [CommentUpdoot])
  @OneToMany(() => CommentUpdoot, (updoot) => updoot.comment, { cascade: true })
  updoots: CommentUpdoot[];

  @Field(() => [Comment])
  replies: Comment[];
}
