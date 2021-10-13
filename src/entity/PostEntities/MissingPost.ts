import {
  EntityWithBase,
  EntityWithDates,
  EntityWithLocation,
} from '../../utils/class-mixins';
import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { MissingPostTypes, PrivacyType } from '../../types/types';
import { PostUpdoot } from '../InteractionsEntities/PostUpdoot';
import { Comment } from './../InteractionsEntities/Comment';
import { User } from './../UserEntities/User';

@ObjectType()
@Entity()
export class MissingPost extends EntityWithDates(
  EntityWithLocation(EntityWithBase(BaseEntity))
) {
  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.missingPosts, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Field(() => String)
  @Column({ type: 'text' })
  title: string;

  @Field(() => String)
  @Column({ type: 'text' })
  description: string;

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
