import { Field, Int, ObjectType } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@ObjectType()
@Entity()
export class Photo {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  url: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.photos)
  @JoinColumn()
  user!: User;
}
