import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, OneToMany } from 'typeorm';
import { PetGender, PetSize, PetType } from '../../types/enums.types';
import { EntityWithBase, EntityWithDates } from '../../utils/class-mixins';
import { PetBreed } from './PetBreed';
import { PetColor } from './PetColors';

@ObjectType()
@Entity()
export abstract class AbstractPet extends EntityWithDates(
  EntityWithBase(BaseEntity)
) {
  @Field(() => String)
  @Column()
  name!: string;

  @Field(() => PetType)
  @Column({ type: 'enum', enum: PetType })
  type!: PetType;

  @Field(() => PetGender)
  @Column({ type: 'enum', enum: PetGender })
  gender!: PetGender;

  @Field(() => PetSize)
  @Column({ type: 'enum', enum: PetSize })
  size!: PetSize;

  @Field(() => Date)
  @Column()
  birthDate!: Date;

  //Relations

  @Field(() => [PetBreed])
  @OneToMany(() => PetBreed, (pb) => pb.pet, { cascade: true, eager: true })
  breeds: PetBreed[];

  @Field(() => [PetColor])
  @OneToMany(() => PetColor, (pb) => pb.pet, { cascade: true, eager: true })
  colors: PetColor[];
}
