import { Breeds, PetType, PetGender, PetSize, PetStatus } from './types';
import { Pet } from '../entity/Pet';
import { IsEmail, Length, MaxLength } from 'class-validator';
import { Field, InputType, ObjectType, Int } from 'type-graphql';
import { User } from '../entity/User';
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

  @Field(() => PetStatus)
  status!: PetStatus;

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
