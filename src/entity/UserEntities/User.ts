import { Comment } from './../InteractionsEntities/Comment';
import { MissingPost } from './../PostEntities/MissingPost';
import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pet } from '../PetEntities/Pet';
import { AdoptionPost } from '../PostEntities/AdoptionPost';
import { UserFavorites } from './UserFavorites';
import { UserPet } from './UserPet';

import { PostUpdoot } from '../InteractionsEntities/PostUpdoot';
import { UserTag } from './UserTags';
import { Photo } from '../MediaEntities/Photo';

enum ProviderTypes {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  APPLE = 'apple',
}

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column({ unique: true })
  phone!: string;

  @Field()
  @Column()
  full_name!: string;

  @Field()
  @Column({ default: ProviderTypes.LOCAL })
  provider: ProviderTypes;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  provider_id: number;

  @Field(() => String, { nullable: true })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  lat: number;

  @Field(() => String, { nullable: true })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  lng: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  bio: string;

  @Field()
  @Column({ default: false })
  confirmed: Boolean;

  @Field()
  @Column({ default: false })
  blocked: Boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  last_login: Date;

  @Column()
  password!: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [Photo], { nullable: true })
  @OneToMany(() => Photo, (photo) => photo.creator)
  photos!: Photo[];

  //Relationships
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  avatarId: number;

  @Field(() => Photo, { nullable: true })
  @OneToOne(() => Photo, { cascade: true })
  @JoinColumn()
  avatar: Photo;

  @Field(() => [Pet], { nullable: true })
  @OneToMany(() => Pet, (pet) => pet.user)
  pets: Pet[];

  @Field(() => [UserTag], { nullable: true })
  @OneToMany(() => UserTag, (tag) => tag.user)
  tags: UserTag[];

  @Field(() => [UserFavorites], { nullable: true })
  @OneToMany(() => UserFavorites, (fav) => fav.user)
  favorites: UserFavorites[];

  @Field(() => [UserPet], { nullable: true })
  @OneToMany(() => UserPet, (userPet) => userPet.user)
  userPets: UserPet[];

  @Field(() => [AdoptionPost], { nullable: true })
  @OneToMany(() => AdoptionPost, (post) => post.user)
  adoptionPosts: AdoptionPost[];

  @Field(() => [MissingPost], { nullable: true })
  @OneToMany(() => MissingPost, (post) => post.user)
  missingPosts: MissingPost[];

  @Field(() => [PostUpdoot])
  @OneToMany(() => PostUpdoot, (updoot) => updoot.user)
  updoots: PostUpdoot[];

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
