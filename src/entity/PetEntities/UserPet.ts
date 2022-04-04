import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { EntityWithBase, EntityWithDates } from '../../utils/class-mixins';
import { User } from '../UserEntities/User';
import { Pet } from './Pet';

@ObjectType()
@Entity()
export class UserPet extends EntityWithDates(EntityWithBase(BaseEntity)) {
  @Field(() => Int)
  @PrimaryColumn()
  petId: number;

  @Field(() => Pet, { nullable: true })
  @OneToOne(() => Pet, { nullable: true })
  pet!: Pet;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.ownedPets, { onDelete: 'CASCADE' })
  user: User;

  @Field()
  @Column()
  about!: string;
}
