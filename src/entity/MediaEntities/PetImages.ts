import { Field, ObjectType, Int } from 'type-graphql';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Pet } from '../PetEntities/Pet';
import { Photo } from './Photo';

@ObjectType()
@Entity()
export class PetImages extends BaseEntity {
  @Field(() => Int)
  @PrimaryColumn()
  petId: number;

  @Field(() => Pet)
  @ManyToOne(() => Pet, (pet) => pet.images, { onDelete: 'CASCADE' })
  pet!: Pet;

  @Field(() => Int)
  @PrimaryColumn()
  photoId: number;

  @Field(() => Photo)
  @OneToOne(() => Photo, { cascade: true })
  @JoinColumn()
  photo!: Photo;
}
