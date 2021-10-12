import { Comment } from './../InteractionsEntities/Comment';
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
import { MissingPostTypes, PrivacyType } from '../../types/types';
import { Address } from '../Address';
import { Pet } from '../PetEntities/Pet';
import { User } from '../UserEntities/User';
import { PostUpdoot } from '../InteractionsEntities/PostUpdoot';

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

  @Field(() => PrivacyType)
  @Column({
    nullable: true,
    type: 'enum',
    enum: MissingPostTypes,
    default: MissingPostTypes.Missing,
  })
  type: MissingPostTypes;

  //updoots Section
  @Field(() => Int)
  @Column({ default: 0 })
  points: number;

  @Field(() => [PostUpdoot])
  @OneToMany(() => PostUpdoot, (updoot) => updoot.post, { cascade: true })
  updoots: PostUpdoot[];

  //Comments Section

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];
}
