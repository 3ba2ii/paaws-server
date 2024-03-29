import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import {
  MissingPostTags,
  MissingPostTypes,
  PrivacyType,
} from '../../types/enums.types';
import {
  EntityWithBase,
  EntityWithDates,
  EntityWithLocation,
} from '../../utils/class-mixins';
import { PostUpdoot } from '../InteractionsEntities/PostUpdoot';
import { Photo } from '../MediaEntities/Photo';
import { PostImages } from '../MediaEntities/PostImages';
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

  @Field(() => String)
  descriptionSnippet: string;

  @Field(() => PrivacyType)
  @Column({
    nullable: true,
    type: 'enum',
    enum: PrivacyType,
    default: PrivacyType.PUBLIC,
  })
  privacy: PrivacyType;

  @Field(() => MissingPostTypes)
  @Column({
    nullable: true,
    type: 'enum',
    enum: MissingPostTypes,
    default: MissingPostTypes.Missing,
  })
  type: MissingPostTypes;

  //Images and Thumbnails
  @Field(() => [PostImages])
  @OneToMany(() => PostImages, (image) => image.post, { cascade: true })
  images: PostImages[];

  //updoots Section
  @Field(() => Int)
  @Column({ default: 0 })
  points: number;

  @Field(() => [PostUpdoot])
  @OneToMany(() => PostUpdoot, (updoot) => updoot.post, { cascade: true })
  updoots: PostUpdoot[];

  @Field(() => Int, { nullable: true })
  voteStatus: number; // 1 for upvote, -1 for downvote, null for no vote

  //Comments Section
  @Field(() => Int)
  @Column({ default: 0 })
  commentsCount: number;

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];

  @Field(() => Int)
  @Column({ nullable: true })
  thumbnailId: number;

  @Field(() => Photo, { nullable: true })
  @OneToOne(() => Photo, { cascade: true })
  @JoinColumn()
  thumbnail: Photo;

  @Field(() => [MissingPostTags])
  tags: [MissingPostTags];

  /* Contact Info Fields */
  @Field(() => Boolean, { defaultValue: true })
  @Column({ type: 'boolean', default: true })
  showPhoneNumber: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @Column({ type: 'boolean', default: true })
  showEmail: boolean;
}
