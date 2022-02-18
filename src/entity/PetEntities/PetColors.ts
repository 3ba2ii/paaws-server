import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Breeds, PetColors } from '../../types/enums.types';
import { Pet } from './Pet';

@ObjectType()
@Entity()
export class PetColor extends BaseEntity {
  @Field()
  @PrimaryColumn()
  petId: number;

  @Field(() => Pet)
  @ManyToOne(() => Pet, (user) => user.breeds, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  pet!: Pet;

  @Field(() => Breeds)
  @PrimaryColumn({ type: 'enum', enum: PetColors, enumName: 'Pet_Colors' })
  color!: PetColors;
}

///
