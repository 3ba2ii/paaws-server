import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { EntityWithDates } from '../../utils/class-mixins';
import { User } from '../UserEntities/User';
import { Pet } from './Pet';

@ObjectType()
@Entity()
export class OwnedPet extends EntityWithDates(BaseEntity) {
  @Field(() => String)
  @Column({ type: 'text' })
  about!: string;

  @Field(() => Int)
  @PrimaryColumn()
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
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.ownedPets, { onDelete: 'CASCADE' })
  user: User;
}
