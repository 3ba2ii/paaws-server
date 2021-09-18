import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Photo } from './Photo';
import { User } from './User';

@ObjectType()
@Entity()
export class UserAvatar extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.avatars)
  user: User;

  @Field(() => Photo)
  @OneToOne(() => Photo)
  @JoinColumn()
  image: Photo;
}
