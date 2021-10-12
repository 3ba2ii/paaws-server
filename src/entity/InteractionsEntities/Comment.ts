import { MissingPost } from './../PostEntities/MissingPost';
import { CommentUpdoot } from './CommentUpdoots';
import { User } from './../UserEntities/User';
import { Field, ObjectType, Int } from 'type-graphql';
import {
  Entity,
  BaseEntity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  parentId: number; //if it is null then it is a root comment else it is a reply

  @Field()
  @Column()
  text: string;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @Field(() => Int)
  @Column()
  postId: number;

  @Field(() => MissingPost)
  @ManyToOne(() => MissingPost, (post) => post.comments)
  post: MissingPost;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  points: number;

  @Field(() => [CommentUpdoot])
  @OneToMany(() => CommentUpdoot, (updoot) => updoot.comment, { cascade: true })
  updoots: CommentUpdoot[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
