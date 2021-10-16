import { ObjectType } from 'type-graphql';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { MissingPost } from '../PostEntities/MissingPost';
import { Updoot } from './Updoot';

@ObjectType()
@Entity()
export class PostUpdoot extends Updoot {
  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => MissingPost, (post) => post.updoots, {
    onDelete: 'CASCADE',
  })
  post: MissingPost;
}
