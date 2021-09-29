import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PetGender, PetSize, PetType } from '../../types/types';
import { User } from '../UserEntities/User';
import { PetImages } from './../MediaEntities/PetImages';
import { PetBreed } from './PetBreed';

@ObjectType()
@Entity()
export class Pet extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  readonly id!: number;

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
  spayed: Boolean;

  @Field(() => Boolean, { nullable: true })
  @Column({ nullable: true })
  neutered: Boolean;

  @Field()
  @Column()
  about!: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

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

  //TODO: Should add a pet colors and pet images

  @Field(() => [PetImages])
  @OneToMany(() => PetImages, (petImages) => petImages.pet, { cascade: true })
  images!: PetImages[];
}
