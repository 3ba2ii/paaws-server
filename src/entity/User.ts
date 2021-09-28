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
import { Pet } from './Pet';
import { Photo } from './Photo';
import { UserFavorites } from './UserFavorites';
import { UserTag } from './UserTags';

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
  long: number;

  @Field(() => String, { nullable: true })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  lat: number;

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
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [Photo], { nullable: true })
  @OneToMany(() => Photo, (photo) => photo.creator)
  photos!: Photo[];

  //Relationships
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
}
