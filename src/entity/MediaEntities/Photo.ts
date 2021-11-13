import { Field, ObjectType, Int } from 'type-graphql';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { EntityWithBase, EntityWithDates } from '../../utils/class-mixins';
import { User } from '../UserEntities/User';

@ObjectType()
@Entity()
export class Photo extends EntityWithDates(EntityWithBase(BaseEntity)) {
  @Field(() => String)
  @Column()
  filename: string;

  @Field({ nullable: true })
  @Column()
  url: string;

  @Field(() => Int)
  @Column()
  creatorId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.photos)
  @JoinColumn()
  creator!: User;
}
