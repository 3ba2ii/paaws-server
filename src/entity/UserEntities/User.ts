import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ProviderTypes, UserGender } from '../../types/enums.types';
import {
  EntityWithBase,
  EntityWithDates,
  EntityWithLocation,
} from '../../utils/class-mixins';
import { PostUpdoot } from '../InteractionsEntities/PostUpdoot';
import { Photo } from '../MediaEntities/Photo';
import { OwnedPet } from '../PetEntities/OwnedPet';
import { AdoptionPost } from '../PostEntities/AdoptionPost';
import { Comment } from './../InteractionsEntities/Comment';
import { Notification } from './../Notification/Notification';
import { MissingPost } from './../PostEntities/MissingPost';
import { UserFavorites } from './UserFavorites';
import { UserTag } from './UserTags';

@ObjectType()
@Entity()
export class User extends EntityWithDates(
  EntityWithBase(EntityWithLocation(BaseEntity))
) {
  @Field()
  @Column({ unique: true })
  email!: string;

  @Field({ nullable: true })
  @Column({ unique: true, nullable: true })
  phone: string;

  @Field()
  @Column()
  full_name!: string;

  @Field()
  displayName: string;

  @Field()
  @Column({ default: ProviderTypes.LOCAL })
  provider: ProviderTypes;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, unique: true })
  providerId: string;

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
  phoneVerified: Boolean;

  @Field()
  @Column({ default: false })
  blocked: Boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  last_login: Date;

  @Column({ nullable: true })
  password: string;

  @Field(() => UserGender, { nullable: true })
  @Column({ nullable: true })
  gender: UserGender;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  birthDate: Date;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  petsCount: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  missingPostsCount: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  adoptionPostsCount: number;

  @Field(() => Int)
  totalPostsCount: number;

  //Relationships
  @Field(() => [Photo], { nullable: true })
  @OneToMany(() => Photo, (photo) => photo.creator)
  photos!: Photo[];

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  avatarId: number;

  @Field(() => Photo, { nullable: true })
  @OneToOne(() => Photo, { cascade: true })
  @JoinColumn()
  avatar: Photo;

  @Field(() => [OwnedPet], { nullable: true })
  @OneToMany(() => OwnedPet, (pet) => pet.user)
  ownedPets: OwnedPet[];

  @Field(() => [UserTag], { nullable: true })
  @OneToMany(() => UserTag, (tag) => tag.user)
  tags: UserTag[];

  @Field(() => [UserFavorites], { nullable: true })
  @OneToMany(() => UserFavorites, (fav) => fav.user)
  favorites: UserFavorites[];

  @Field(() => [OwnedPet], { nullable: true })
  @OneToMany(() => OwnedPet, (userPet) => userPet.user)
  userPets: OwnedPet[];

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

  @Field(() => [Notification])
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
