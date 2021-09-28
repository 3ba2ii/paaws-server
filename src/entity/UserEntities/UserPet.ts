import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Pet } from '../PetEntities/Pet';
import { User } from './User';

@ObjectType()
@Entity()
export class UserPet extends BaseEntity {
  @Field()
  @PrimaryColumn()
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.userPets, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Field()
  @PrimaryColumn()
  petId: string;

  @OneToOne(() => Pet)
  @JoinColumn()
  pet: Pet;
}
