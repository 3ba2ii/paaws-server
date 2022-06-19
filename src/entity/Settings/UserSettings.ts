import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { EntityWithBase } from '../../utils/class-mixins';
import { User } from '../UserEntities/User';
import { AllowedSettingValue } from './AllowedSettingValue';
import { Setting } from './Settings';

@ObjectType()
@Entity()
export class UserSetting extends EntityWithBase(BaseEntity) {
  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.settings)
  user: User;

  @Field(() => Int)
  @Column()
  settingId: number;

  @Field(() => Setting)
  @OneToOne(() => Setting)
  @JoinColumn()
  setting: Setting;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  allowedSettingValueId: number;

  @Field(() => AllowedSettingValue)
  @OneToOne(() => AllowedSettingValue)
  @JoinColumn()
  allowedSettingValue: AllowedSettingValue;

  @Field({ nullable: true })
  @Column({ nullable: true })
  unconstrainedValue: string;
}
