import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../UserEntities/User';

@ObjectType()
@Entity()
export class Photo extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ default: `${new Date()}` })
  filename: string;

  //Add bytea and path columns

  @Field(() => String)
  @Column({ nullable: true })
  path: string;

  @Field(() => Boolean)
  @Column({ default: true })
  isOnDisk: boolean;

  @Field({ nullable: true })
  url: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isThumbnail: boolean;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.photos)
  @JoinColumn()
  creator!: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
