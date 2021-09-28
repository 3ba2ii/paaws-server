import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from '../Address';
import { Pet } from '../PetEntities/Pet';
import { User } from '../UserEntities/User';

@ObjectType()
@Entity()
export class AdoptionPost extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.adoptionPosts, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Field()
  @Column()
  petId: string;

  @OneToOne(() => Pet)
  @JoinColumn()
  pet: Pet;

  //Post Info
  @Field()
  @Column()
  title: string;

  @OneToOne(() => Address)
  @JoinColumn()
  address: Address;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
