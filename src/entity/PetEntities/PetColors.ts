import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { PetColors } from '../../types/enums.types';
import { Pet } from './Pet';

@ObjectType()
@Entity()
export class PetColor extends BaseEntity {
  @Field()
  @PrimaryColumn()
  petId: number;

  @Field(() => Pet)
  @ManyToOne(() => Pet, (p) => p.breeds, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  pet!: Pet;

  @Field(() => PetColors)
  @PrimaryColumn({ type: 'enum', enum: PetColors, enumName: 'Pet_Colors' })
  color!: PetColors;
}

///
