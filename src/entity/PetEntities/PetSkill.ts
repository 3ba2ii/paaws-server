import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  BeforeInsert,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
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

  @Field()
  @PrimaryColumn()
  skill!: string;

  @BeforeInsert()
  async trimAndLower() {
    this.skill = this.skill.trim().toLowerCase();
  }
}
