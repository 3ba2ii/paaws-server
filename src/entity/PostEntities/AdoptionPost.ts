import { Field, Int, ObjectType } from 'type-graphql';
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

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.adoptionPosts, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Field(() => Int)
  @Column()
  petId: number;

  @Field(() => Pet)
  @OneToOne(() => Pet, { cascade: true })
  @JoinColumn()
  pet: Pet;

  //Post Info

  @OneToOne(() => Address, { nullable: true })
  @JoinColumn()
  address: Address;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
