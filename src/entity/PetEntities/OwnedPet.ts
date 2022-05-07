import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { EntityWithBase, EntityWithDates } from '../../utils/class-mixins';
import { User } from '../UserEntities/User';
import { Pet } from './Pet';

@ObjectType()
@Entity()
export class OwnedPet extends EntityWithDates(EntityWithBase(BaseEntity)) {
  @Field(() => String)
  @Column({ type: 'text' })
  about!: string;

  @Field(() => Int)
  @Column()
  petId: number;
  //
  @Field(() => Pet)
  @OneToOne(() => Pet, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn()
  pet!: Pet;

  @Field()
  @Column()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.ownedPets, { onDelete: 'CASCADE' })
  user: User;
}
