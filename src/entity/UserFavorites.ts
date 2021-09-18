import { Pet } from './Pet';
import { ObjectType, Field } from 'type-graphql';
import { Entity, BaseEntity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@ObjectType()
@Entity()
export class UserFavorites extends BaseEntity {
  @PrimaryColumn()
  userId!: number;

  @PrimaryColumn()
  @Column()
  petId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.favorites)
  user: User;

  @Field(() => Pet)
  pet: Pet;
}
