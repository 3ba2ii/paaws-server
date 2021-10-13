import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { MissingPost } from './../PostEntities/MissingPost';
import { Photo } from './Photo';

@ObjectType()
@Entity()
export class PostImages extends BaseEntity {
  @Field(() => Int)
  @PrimaryColumn()
  postId: number;

  @Field(() => MissingPost)
  @ManyToOne(() => MissingPost, (post) => post.images, { onDelete: 'CASCADE' })
  post!: MissingPost;

  @Field(() => Int)
  @PrimaryColumn()
  photoId: number;

  @Field(() => Photo)
  @OneToOne(() => Photo, { cascade: true, eager: true })
  @JoinColumn()
  photo!: Photo;
}
/* 

*/
