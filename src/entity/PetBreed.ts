import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Breeds } from '../types/types';
import { Pet } from './Pet';

@ObjectType()
@Entity()
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
}

///
