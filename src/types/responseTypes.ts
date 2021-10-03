import { IsEmail, Length, MaxLength } from 'class-validator';
import { AdoptionPost } from '../entity/PostEntities/AdoptionPost';
import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { Pet } from '../entity/PetEntities/Pet';
import { User } from '../entity/UserEntities/User';
import { Breeds, PetGender, PetSize, PetType } from './types';
//
@InputType()
export class RegisterOptions {
  @Field()
  @MaxLength(100)
  full_name!: string;

  @Field()
  phone!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @Length(8, 40)
  password!: string;

  @Field(() => Int)
  otp!: number;
}

@InputType()
export class LoginInput {
  @Field()
  identifier!: string;

  @Field()
  password!: string;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;

  @Field()
  code!: number;
}

@ObjectType()
export class PaginatedUsers {
  @Field(() => [User])
  users: User[];

  @Field()
  hasMore: boolean;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
@ObjectType()
export class UploadImageResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field({ nullable: true })
  url?: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class RegularResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Boolean, { defaultValue: false })
  success: boolean;
}

@ObjectType()
export class PetResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Pet, { nullable: true })
  pet?: Pet;
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
  spayed: Boolean;

  @Field(() => Boolean, {
    defaultValue: false,
  })
  neutered: Boolean;

  @Field()
  about!: string;

  @Field(() => [Breeds])
  breeds!: Breeds[];
}

@ObjectType()
export class ChangePasswordResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Boolean)
  success: boolean;
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

@ObjectType()
export class AdoptionPostResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => AdoptionPost, { nullable: true })
  adoptionPost?: AdoptionPost;
}

@ObjectType()
export class PaginatedAdoptionPosts {
  @Field(() => [AdoptionPost])
  posts: AdoptionPost[];

  @Field()
  hasMore: boolean;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
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
  spayed?: Boolean;

  @Field(() => Boolean, { nullable: true })
  neutered?: Boolean;

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
