import { Field, Int, ObjectType } from 'type-graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { PetImages } from '../MediaEntities/PetImages';
import { Photo } from '../MediaEntities/Photo';
import { User } from '../UserEntities/User';
import { AbstractPet } from './AbstractPet';

@ObjectType()
@Entity()
export class UserPet extends AbstractPet {
  @Field()
  @Column()
  about!: string;

  /*   @Field(() => [PetSkill])
  @OneToMany(() => PetSkill, (ps) => ps.pet, { cascade: true, eager: true })
  skills: PetSkill[]; */

  @Field(() => Int)
  @Column()
  userId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.ownedPets, {
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
