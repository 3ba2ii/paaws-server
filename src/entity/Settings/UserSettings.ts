import { EntityWithBase, EntityWithDates } from '../../utils/class-mixins';
import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, OneToOne } from 'typeorm';
import { User } from '../UserEntities/User';

@ObjectType()
@Entity()
export class UserSetting extends EntityWithBase(EntityWithDates(BaseEntity)) {
  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.settings) // specify inverse side as a second parameter
  user: User;

  @Field(() => Boolean)
  @Column({ default: true })
  showEmail: boolean;

  @Field(() => Boolean)
  @Column({ default: true })
  showPhone: boolean;

  @Field(() => String)
  @Column()
  accountURL: string;

  @Field(() => String)
  @Column()
  language: string;
}
