import { Field, Int, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../UserEntities/User';
import { Post } from './Post';

@ObjectType()
@Entity()
export class AdoptionPost extends Post {
  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.adoptionPosts, {
    onDelete: 'CASCADE',
  })
  user: User;
}
