import { Field, ObjectType, Int } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../UserEntities/User';
import { MissingPost } from '../PostEntities/MissingPost';

@ObjectType()
@Entity()
export class PostUpdoot extends BaseEntity {
  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.updoots)
  user: User;

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => MissingPost, (post) => post.updoots, {
    onDelete: 'CASCADE',
  })
  post: MissingPost;

  @Field(() => Int)
  @Column({ type: 'int' })
  value: number; //1 or -1
}
