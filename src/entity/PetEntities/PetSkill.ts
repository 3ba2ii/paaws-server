/* import { Skills } from './../../types/enums.types';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { OwnedPet } from './OwnedPet';

@ObjectType()
@Entity()
export class PetSkill extends BaseEntity {
  @Field()
  @PrimaryColumn()
  petId: number;

  @Field(() => OwnedPet)
  @ManyToOne(() => OwnedPet, (p) => p.skills)
  pet!: OwnedPet;

  @Field(() => Skills)
  @PrimaryColumn({ type: 'enum', enum: Skills, enumName: 'PetSkills' })
  skill!: Skills;
}
 */
