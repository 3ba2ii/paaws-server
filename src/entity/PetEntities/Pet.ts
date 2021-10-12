import { PetType, PetGender, PetSize } from '../../types/types';
import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Photo } from '../MediaEntities/Photo';
import { User } from '../UserEntities/User';
import { PetImages } from './../MediaEntities/PetImages';
import { PetBreed } from './PetBreed';
import { PetColor } from './PetColors';

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
  spayedOrNeutered: Boolean;

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

  @Field(() => [PetColor])
  @OneToMany(() => PetColor, (pb) => pb.pet, { cascade: true, eager: true })
  colors: PetColor[];

  //TODO: Should add a pet colors and pet images

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
