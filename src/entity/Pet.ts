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
import { PetGender, PetSize, PetStatus, PetType } from '../types/petTypes';
import { PetBreed } from './PetBreed';
import { User } from './User';

@ObjectType()
@Entity()
export class Pet extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Field(() => String)
  @Column()
  name!: string;

  @Field(() => PetStatus)
  @Column({
    default: PetStatus.OFFERED,
  })
  status: PetStatus;

  @Field(() => PetType)
  @Column()
  type!: PetType;

  @Field(() => PetGender)
  @Column()
  gender!: PetGender;

  @Field(() => PetSize)
  @Column()
  size!: PetSize;

  @Field(() => Date)
  @Column()
  birthDate!: Date;

  @Field(() => Boolean, {
    nullable: true,
  })
  @Column({ nullable: true })
  vaccinated: Boolean;

  @Field(() => Boolean, {
    nullable: true,
  })
  @Column({ nullable: true })
  spayed: Boolean;

  @Field(() => Boolean, {
    nullable: true,
  })
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
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.pets)
  user: User;

  @Field(() => [PetBreed])
  @OneToMany(() => PetBreed, (pb) => pb.pet, {
    cascade: true,
  })
  breeds!: PetBreed[];
} //
