import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  BeforeInsert,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Pet } from './Pet';

@ObjectType()
@Entity()
export class PetSkill extends BaseEntity {
  @Field()
  @PrimaryColumn()
  petId: number;

  @Field(() => Pet)
  @ManyToOne(() => Pet, (p) => p.skills)
  pet!: Pet;

  @Field()
  @PrimaryColumn()
  skill!: string;

  @BeforeInsert()
  async trimAndLower() {
    this.skill = this.skill.trim().toLowerCase();
  }
}
