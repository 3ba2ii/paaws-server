import { Field, Int, ObjectType } from 'type-graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Photo } from '../MediaEntities/Photo';
import { User } from '../UserEntities/User';
import { PetImages } from './../MediaEntities/PetImages';
import { AbstractPet } from './AbstractPet';

@ObjectType()
@Entity()
export class Pet extends AbstractPet {
  @Field()
  @Column()
  about!: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ nullable: true })
  vaccinated: Boolean;

  @Field(() => Boolean, { nullable: true })
  @Column({ nullable: true })
  spayedOrNeutered: Boolean;

  @Field(() => Int)
  @Column()
  userId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.pets, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  user!: User;

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
