import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { PetGender, PetSize, PetType } from '../../types/enums.types';
import { EntityWithBase, EntityWithDates } from '../../utils/class-mixins';
import { Photo } from '../MediaEntities/Photo';
import { User } from '../UserEntities/User';
import { PetImages } from './../MediaEntities/PetImages';
import { PetBreed } from './PetBreed';
import { PetColor } from './PetColors';

@ObjectType()
@Entity()
export class Pet extends EntityWithDates(EntityWithBase(BaseEntity)) {
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

  @Field(() => Boolean, { nullable: true })
  @Column({ nullable: true })
  vaccinated: Boolean;

  @Field(() => Boolean, { nullable: true })
  @Column({ nullable: true })
  spayedOrNeutered: Boolean;

  @Field()
  @Column()
  about!: string;

  //Relations
  @Field(() => Int)
  @Column()
  userId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.pets, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Field(() => [PetBreed])
  @OneToMany(() => PetBreed, (pb) => pb.pet, { cascade: true, eager: true })
  breeds: PetBreed[];

  @Field(() => [PetColor])
  @OneToMany(() => PetColor, (pb) => pb.pet, { cascade: true, eager: true })
  colors: PetColor[];

  @Field(() => [PetImages], { nullable: true })
  @OneToMany(() => PetImages, (petImages) => petImages.pet, {
    cascade: true,
    eager: true,
  })
  images: PetImages[];

  @Column({ nullable: true })
  thumbnailId: number;

  @Field(() => Photo, { nullable: true })
  @OneToOne(() => Photo, { cascade: true })
  @JoinColumn()
  thumbnail: Photo;
}
