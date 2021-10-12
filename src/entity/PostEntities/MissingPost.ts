import { User } from './../UserEntities/User';
import { Field, Int, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { MissingPostTypes, PrivacyType } from '../../types/types';
import { PostUpdoot } from '../InteractionsEntities/PostUpdoot';
import { Comment } from './../InteractionsEntities/Comment';
import { Post } from './Post';

@ObjectType()
@Entity()
export class MissingPost extends Post {
  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.missingPosts, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Field(() => PrivacyType)
  @Column({
    nullable: true,
    type: 'enum',
    enum: PrivacyType,
    default: PrivacyType.PUBLIC,
  })
  privacy: PrivacyType;

  @Field(() => PrivacyType)
  @Column({
    nullable: true,
    type: 'enum',
    enum: MissingPostTypes,
    default: MissingPostTypes.Missing,
  })
  type: MissingPostTypes;

  //updoots Section
  @Field(() => Int)
  @Column({ default: 0 })
  points: number;

  @Field(() => [PostUpdoot])
  @OneToMany(() => PostUpdoot, (updoot) => updoot.post, { cascade: true })
  updoots: PostUpdoot[];

  //Comments Section

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];
}
