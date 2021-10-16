import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../UserEntities/User';

@ObjectType()
export abstract class Updoot extends BaseEntity {
  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.updoots) //
  user: User;

  @Field(() => Int)
  @Column({ type: 'int' })
  value: number; //1 or -1
}
