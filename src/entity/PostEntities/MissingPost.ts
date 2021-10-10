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
import { PrivacyType } from '../../types/types';
import { Address } from '../Address';
import { Pet } from '../PetEntities/Pet';
import { User } from '../UserEntities/User';
import { Updoot } from '../InteractionsEntities/Updoot';

@ObjectType()
@Entity()
export class MissingPost extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.missingPosts, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Field(() => Int)
  @Column()
  petId: number;

  @Field(() => Pet)
  @OneToOne(() => Pet, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  pet: Pet;

  //Post Info
  @Column({ nullable: true })
  addressId: number;

  @Field(() => Address, { nullable: true })
  @OneToOne(() => Address, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  address: Address;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => PrivacyType)
  @Column({
    nullable: true,
    type: 'enum',
    enum: PrivacyType,
    default: PrivacyType.PUBLIC,
  })
  privacy: PrivacyType;

  //updoots and comments
  @Field(() => Int)
  @Column({ default: 0 })
  points: number;

  @Field(() => [Updoot])
  @OneToMany(() => Updoot, (updoot) => updoot.post, { cascade: true })
  updoots: Updoot[];
}
