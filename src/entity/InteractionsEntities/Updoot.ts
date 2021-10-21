import { EntityWithDates } from '../../utils/class-mixins';
import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../UserEntities/User';

@ObjectType()
export abstract class Updoot extends EntityWithDates(BaseEntity) {
  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.updoots) //
  user: User;

  @Field(() => Int)
  @Column({ type: 'int' })
  value: number; //1 or -1

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  changes: number = 0; //will keep track of how many times the user has changed their updoot value
}
