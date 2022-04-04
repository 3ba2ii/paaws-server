import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Field, InputType, Int } from 'type-graphql';
import { PetColors, ProviderTypes } from '../types/enums.types';
import { IsNotBlank } from '../utils/CustomClassValidators/IsNotBlank';
import {
  Breeds,
  DateFilters,
  LocationFilters,
  MissingPostTypes,
  PetGender,
  PetSize,
  PetType,
  PrivacyType,
  SortingOrder,
} from './enums.types';

@InputType()
export class BaseRegisterInput {
  @Field()
  @MaxLength(100)
  full_name!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @Length(8, 40)
  password: string;

  @Field()
  @Length(8, 40)
  confirmPassword: string;
}

@InputType()
export class RegisterWithAuthProviderInput extends BaseRegisterInput {
  @Field()
  provider!: ProviderTypes;

  @Field()
  providerId!: string;
}

@InputType()
export class LoginInput {
  @Field()
  identifier!: string;

  @Field()
  password!: string;
}

@InputType()
export class CreatePetOptions {
  @Field()
  @MaxLength(255)
  name!: string;

  @Field(() => PetType)
  type!: PetType;

  @Field(() => PetGender)
  gender!: PetGender;

  @Field(() => PetSize)
  size!: PetSize;

  @Field(() => Date)
  birthDate!: Date;

  @Field(() => Boolean, {
    defaultValue: false,
  })
  vaccinated: Boolean;

  @Field(() => Boolean, {
    defaultValue: false,
  })
  spayedOrNeutered: Boolean;

  @Field()
  about!: string;

  @Field(() => [Breeds])
  breeds!: Breeds[];

  @Field(() => Int)
  thumbnailIdx!: number;
}

@InputType()
export class CreatePetInput {
  @Field()
  @MaxLength(255)
  name!: string;

  @Field(() => PetType)
  type!: PetType;

  @Field(() => PetGender)
  gender!: PetGender;

  @Field(() => PetSize)
  size!: PetSize;

  @Field(() => Date)
  birthDate!: Date;

  @Field()
  about!: string;

  @Field(() => [Breeds])
  breeds!: Breeds[];

  @Field(() => [PetColors])
  colors!: PetColors[];

  @Field(() => Int)
  thumbnailIdx!: number;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  token!: string;

  @Field()
  password!: string;

  @Field()
  confirmPassword!: string;
}

//ADOPTION POST

@InputType()
export class AddressInput {
  @Field({ nullable: true })
  street: string;

  @Field({ nullable: true })
  city: string;

  @Field({ nullable: true })
  state: string;

  @Field({ nullable: true })
  zip: string;

  @Field({ nullable: true })
  country: string;

  @Field()
  lat: number;

  @Field()
  lng: number;
}

@InputType()
export class AdoptionPostInput {
  @Field(() => CreatePetOptions)
  petInfo: CreatePetOptions;

  @Field(() => AddressInput, { nullable: true })
  address?: AddressInput;
}

@InputType()
export class AdoptionPostUpdateInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => PetType, { nullable: true })
  type?: PetType;

  @Field(() => PetGender, { nullable: true })
  gender?: PetGender;

  @Field(() => PetSize, { nullable: true })
  size?: PetSize;

  @Field(() => Date, { nullable: true })
  birthDate?: Date;

  @Field(() => Boolean, { nullable: true })
  vaccinated?: Boolean;

  @Field(() => Boolean, { nullable: true })
  spayedOrNeutered?: Boolean;

  @Field({ nullable: true })
  about?: string;

  @Field(() => [Breeds], { nullable: true })
  breeds?: Breeds[];
}

@InputType()
export class AdoptionPetsFilters {
  @Field(() => [PetType], { nullable: true, defaultValue: [] })
  petTypes?: [PetType];

  @Field(() => [PetGender], { nullable: true, defaultValue: [] })
  petGenders?: [PetGender];

  @Field(() => [PetSize], { nullable: true, defaultValue: [] })
  petSizes?: [PetSize];
}

//what do i need for a missing post
/**
 * user
 * title
 * description
 * location (address where pet was lost or found)
 * pet images
 * type = enum{Missing or Found}
 * Privacy = enum{Public, Private}
 */
@InputType()
export class CreateMissingPostInput {
  @Length(8, 70, { message: 'Title must be between 8 and 70 characters' })
  @Field()
  title: string;

  @Length(15, 500, {
    message: 'Description must be between 15 and 500 characters',
  })
  @Field()
  description: string;

  @Field(() => MissingPostTypes)
  type: MissingPostTypes;

  @Field(() => PrivacyType)
  privacy: PrivacyType;

  @Field(() => AddressInput, { nullable: true })
  address?: AddressInput;

  @Field(() => Int, { defaultValue: 0 })
  thumbnailIdx: number;

  @Field(() => Boolean, { defaultValue: true, nullable: true })
  showPhoneNumber?: boolean;

  @Field(() => Boolean, { defaultValue: true, nullable: true })
  showEmail?: boolean;
}

@InputType()
export class UpdateMissingPostInput {
  @Length(8, 70, { message: 'Title must be between 8 and 70 characters' })
  @Field({ nullable: true })
  title?: string;

  @Length(15, 500, {
    message: 'Description must be between 15 and 500 characters',
  })
  @Field({ nullable: true })
  description?: string;

  @Field(() => MissingPostTypes, { nullable: true })
  type?: MissingPostTypes;

  @Field(() => PrivacyType, { nullable: true })
  privacy?: PrivacyType;

  @Field(() => Boolean, { defaultValue: true, nullable: true })
  showPhoneNumber?: boolean;

  @Field(() => Boolean, { defaultValue: true, nullable: true })
  showEmail?: boolean;
}

@InputType()
export class UpdateUserInfo {
  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Max(80)
  @Min(-180)
  @Field({ nullable: true })
  lng?: number;

  @Max(90)
  @Min(-90)
  @Field({ nullable: true })
  lat?: number;
}

@InputType()
export class WhereClause {
  @Field(() => Int, { nullable: true })
  limit: number;

  @Field({ nullable: true })
  cursor?: string;
}
@InputType()
export class FindNearestUsersInput {
  @Field()
  lat!: number;

  @Field()
  lng!: number;

  @Field()
  radius!: number;
}

@InputType()
export class CreateCommentInputType {
  @IsNotEmpty({ message: 'Please provide a valid comment text' })
  @IsNotBlank('text', { message: 'Please provide a valid comment text' })
  @Field()
  text!: string;

  @Field(() => Int)
  postId!: number;

  @Field(() => Int, {
    nullable: true,
    description: 'parentId refers to the parent comment id in case of replying',
  })
  parentId?: number;
}

@InputType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  limit: number = 10;

  @IsDateString()
  @Field({ nullable: true, description: 'Date must be ISO8601 Format' })
  cursor?: string;
}

@InputType()
export class MissingPostComments extends PaginationArgs {
  @Field(() => Int, { nullable: true })
  postId: number;
}

@InputType()
export class ParentCommentReplies extends PaginationArgs {
  @Field(() => Int, { nullable: true })
  parentId: number;
}
@InputType()
export class LocationFilterComponents {
  @Field(() => LocationFilters, { nullable: true })
  locationFilter?: LocationFilters;

  @Field({ nullable: true })
  lat?: number;

  @Field({ nullable: true })
  lng?: number;
}

@InputType()
export class PostFilters {
  @Field(() => DateFilters, { nullable: true })
  date?: DateFilters;

  @Field(() => LocationFilterComponents, { nullable: true })
  location?: LocationFilterComponents;

  @Field(() => SortingOrder, {
    nullable: true,
    defaultValue: SortingOrder.DESCENDING,
  })
  order?: SortingOrder;
}
