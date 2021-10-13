import { registerEnumType } from 'type-graphql';
export enum PetStatus {
  OFFERED = 'offered',
  ADOPTED = 'adopted',
  DELETED = 'deleted',
}

export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  RABBIT = 'rabbit',
}

export enum PetGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum PetSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
}
export enum Breeds {
  BULLDOG = 'bulldog',
  HUSKEY = 'huskey',
}
export enum PetColors {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
}

export enum UserTagsType {
  CAT_PERSON = 'Cat Person',
  DOG_PERSON = 'Dog Person',
  ADOPTER = 'Adopter',
  ANIMAL_FRIEND = 'Animal Friend',
  ANIMAL_PARTNER = 'Animal Partner',
  ANIMAL_OWNER = 'Animal Owner',
  ANIMAL_OWNER_ADOPTER = 'Animal Owner & Adopter',
}
export enum PrivacyType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  ONYL_ME = 'onyl_me',
}

export enum MissingPostTypes {
  Missing = 'missing',
  Found = 'found',
}

registerEnumType(MissingPostTypes, {
  name: 'MissingPostTypes',
  description: 'Either missing or found',
});

registerEnumType(PrivacyType, {
  name: 'PrivacyType',
  description: 'Post Privacy',
});

registerEnumType(UserTagsType, {
  name: 'UserTagsType',
  description: 'User Tags Option',
});

registerEnumType(Breeds, {
  name: 'Breeds',
  description: 'Basic Pet Breeds',
});

registerEnumType(PetStatus, {
  name: 'PetStatus',
  description: 'Basic Pet Status',
});

registerEnumType(PetType, {
  name: 'PetType',
  description: 'Basic Pet Type',
});

registerEnumType(PetGender, {
  name: 'PetGender',
  description: 'Basic Pet Gender',
});
registerEnumType(PetSize, {
  name: 'PetSize',
  description: 'Basic Pet Size',
});

registerEnumType(PetColors, {
  name: 'PetColors',
  description: 'Basic Pet Colors',
});
