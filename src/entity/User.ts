import { Photo } from './Media';
import { Pet } from './Pet';
import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Field(() => Int, {
    nullable: true,
  })
  @Column({ nullable: true })
  provider_id: number;

  @Field(() => String, {
    nullable: true,
  })
  @Column({ nullable: true })
  location: string;

  @Field(() => String, {
    nullable: true,
  })
  @Column({ nullable: true })
  bio: string;

  @Field()
  @Column({ default: false })
  confirmed: Boolean;

  @Field()
  @Column({ default: false })
  blocked: Boolean;

  @Field()
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

  //Relations
  /*  @Field(() => [Pet])
  @OneToMany(() => Pet, (pet) => pet.user)
  pets: Pet[]; */

  @Field(() => [Photo])
  @OneToMany(() => Photo, (photo) => photo.user)
  photos!: Photo[];

  @Field(() => [Pet])
  @OneToMany(() => Pet, (pet) => pet.user)
  pets: Pet[];
}
