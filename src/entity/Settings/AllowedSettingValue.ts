import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, JoinColumn, ManyToOne, Entity } from 'typeorm';
import { EntityWithBase } from '../../utils/class-mixins';
import { Setting } from './Settings';

@ObjectType()
@Entity()
export class AllowedSettingValue extends EntityWithBase(BaseEntity) {
  @Field(() => Int)
  settingId: number;

  @Field(() => Setting)
  @ManyToOne(() => Setting, { cascade: true, eager: true })
  @JoinColumn()
  setting!: Setting;

  @Field()
  @Column({ type: 'varchar' })
  itemValue: string;

  @Field()
  @Column({ type: 'varchar' })
  caption: string;
}
