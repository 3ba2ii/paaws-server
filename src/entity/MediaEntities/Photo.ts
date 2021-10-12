import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { EntityWithBase, EntityWithDates } from '../../utils/class-mixins';
import { User } from '../UserEntities/User';

@ObjectType()
@Entity()
export class Photo extends EntityWithDates(EntityWithBase(BaseEntity)) {
  @Field(() => String)
  @Column()
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
}
