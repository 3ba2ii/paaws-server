import { Field, ObjectType, registerEnumType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';

enum UserTagsType {
  CAT_PERSON = 'Cat Person',
  DOG_PERSON = 'Dog Person',
  ADOPTER = 'Adopter',
  ANIMAL_FRIEND = 'Animal Friend',
  ANIMAL_PARTNER = 'Animal Partner',
  ANIMAL_OWNER = 'Animal Owner',
  ANIMAL_OWNER_ADOPTER = 'Animal Owner & Adopter',
}

registerEnumType(UserTagsType, {
  name: 'UserTagsType',
  description: 'User Tags Option',
});

@ObjectType()
@Entity()
export class UserTag extends BaseEntity {
  @PrimaryColumn()
  userId!: number;

  @PrimaryColumn()
  @Column()
  tagId!: UserTagsType;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.tags)
  user: User;

  @Field(() => UserTagsType)
  tag: UserTagsType;
}
