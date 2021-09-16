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
