import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, JoinColumn, OneToOne } from 'typeorm';
import {
  EntityWithBase,
  EntityWithDates,
  EntityWithLocation,
} from '../../utils/class-mixins';
import { Pet } from '../PetEntities/Pet';

@ObjectType()
export abstract class Post extends EntityWithDates(
  EntityWithLocation(EntityWithBase(BaseEntity))
) {
  @Field(() => Int)
  @Column()
  petId: number;

  @Field(() => Pet)
  @OneToOne(() => Pet, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  pet: Pet;
}
