/* import { Skills } from './../../types/enums.types';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserPet } from './UserPet';

@ObjectType()
@Entity()
export class PetSkill extends BaseEntity {
  @Field()
  @PrimaryColumn()
  petId: number;

  @Field(() => UserPet)
  @ManyToOne(() => UserPet, (p) => p.skills)
  pet!: UserPet;

  @Field(() => Skills)
  @PrimaryColumn({ type: 'enum', enum: Skills, enumName: 'PetSkills' })
  skill!: Skills;
}
 */
