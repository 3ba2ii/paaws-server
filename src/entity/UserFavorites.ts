import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Pet } from './Pet';
import { User } from './User';

@ObjectType()
@Entity()
export class UserFavorites extends BaseEntity {
  @Field()
  @PrimaryColumn()
  userId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.favorites, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Field()
  @PrimaryColumn()
  petId: number;

  @Field(() => Pet)
  @ManyToOne(() => Pet, (pet) => pet.likes, {
    onDelete: 'CASCADE',
  })
  pet!: Pet;
}

/* 
export class PetBreed extends BaseEntity {
    @Field()
    @PrimaryColumn()
    petId: number;
  
    @Field(() => Pet)
    @ManyToOne(() => Pet, (user) => user.breeds, {
      onDelete: 'CASCADE',
    })
    pet!: Pet;
  
    @Field(() => Breeds)
    @PrimaryColumn({ type: 'enum', enum: Breeds, enumName: 'Breeds' })
    breed!: Breeds;
  } */
