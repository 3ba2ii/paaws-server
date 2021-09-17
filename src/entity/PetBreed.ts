import { Breeds } from '../types/petTypes';
import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pet } from './Pet';

@ObjectType()
@Entity()
export class PetBreed extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Field(() => Pet)
  @ManyToOne((_type) => Pet, (pet) => pet.breeds)
  pet: Pet;

  @Field()
  @Column()
  breed: Breeds;
}
