import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { EntityWithBase } from '../../utils/class-mixins';
import { User } from '../UserEntities/User';

@ObjectType()
@Entity()
export class UserSetting extends EntityWithBase(BaseEntity) {
  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User)
  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Field(() => Boolean)
  @Column({ default: true })
  showEmail: boolean;

  @Field(() => Boolean)
  @Column({ default: true })
  showPhone: boolean;

  @Field(() => String)
  @Column({ unique: true })
  accountURL: string;

  @Field(() => String)
  @Column()
  language: string;
}
