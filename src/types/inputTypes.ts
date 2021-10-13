import { IsEmail, Length, MaxLength } from 'class-validator';
import { Field, InputType, Int } from 'type-graphql';
import {
  Breeds,
  MissingPostTypes,
  PetGender,
  PetSize,
  PetType,
  PrivacyType,
} from './types';

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
  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => MissingPostTypes)
  type: MissingPostTypes;

  @Field(() => PrivacyType)
  privacy: PrivacyType;

  @Field(() => AddressInput, { nullable: true })
  address?: AddressInput;
}
