import { Field, ObjectType, registerEnumType } from 'type-graphql';
import { Column, Entity } from 'typeorm';
import { Metadata } from '.';

export enum UserMetadataDescription {
  USER_ID = 'user_id',
  UPDATE_EMAIL = 'update_email',
  UPDATE_FULL_NAME = 'update_full_name',
  UPDATE_DISPLAY_NAME = 'update_display_name',
  UPDATE_USERNAME = 'updated_username',
  UPDATE_FULL_NAME_COUNT = 'update_full_name_count',
}
registerEnumType(UserMetadataDescription, {
  name: 'UserMetadataDescription',
});

@ObjectType()
@Entity()
export class UserMetadata extends Metadata {
  @Field(() => UserMetadataDescription)
  @Column({ type: 'enum', enum: UserMetadataDescription })
  description: UserMetadataDescription;
}
//
