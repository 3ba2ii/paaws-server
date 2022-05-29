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
export enum Skills {
  LOVELY = 'Lovely',
  CHEERFUL = 'Cheerful',
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
  ONLY_ME = 'only_me',
}

export enum MissingPostTypes {
  Missing = 'missing',
  Found = 'found',
  Rescued = 'rescued',
  ALL = 'All',
}
export enum NotificationType {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE',
  COMMENT_NOTIFICATION = 'COMMENT_NOTIFICATION',
  REPLY_NOTIFICATION = 'REPLY_NOTIFICATION',
  MISSING_PET_AROUND_YOU = 'MISSING_PET_AROUND_YOU',
}

export enum NOTIFICATION_CONTENT_TYPES {
  POST = 'POST', //postId
  COMMENT = 'COMMENT', //commentId on postId
  USER = 'USER', //userId
}
export enum MissingPostTags {
  Missing = 'missing',
  Found = 'found',
  Rescued = 'rescued',
  NearYou = 'near-you',
  Urgent = 'urgent',
}
export enum DateFilters {
  TODAY = 'today',
  LAST_WEEK = 'Last Week',
  LAST_MONTH = 'Last Month',
  LAST_YEAR = 'Last Year',
}

export enum LocationFilters {
  NEAR_ME = 'Near me',
  WITHIN_5KM = 'Within 5KM',
  WITHIN_10KM = 'Within 10KM',
  NEAR_CUSTOM_LOCATION = 'Near Custom Location',
}
export enum SortingOrder {
  ASCENDING = 'Ascending',
  DESCENDING = 'Descending',
}
export enum ProviderTypes {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  APPLE = 'apple',
}
export enum UserGender {
  MALE = 'Male',
  Female = 'Female',
}

registerEnumType(UserGender, {
  name: 'UserGender',
  description: 'The gender of the user',
});
registerEnumType(ProviderTypes, {
  name: 'ProviderTypes',
  description: 'Auth Provider Types',
});
registerEnumType(Skills, {
  name: 'PetSkills',
  description: 'Skills the pet could have',
});

registerEnumType(SortingOrder, {
  name: 'SortingOrder',
  description: 'Sorting Order Filters',
});

registerEnumType(LocationFilters, {
  name: 'LocationFilters',
  description: 'Location Filters',
});
registerEnumType(DateFilters, {
  name: 'DateFilters',
  description: 'Date Filters',
});
registerEnumType(MissingPostTags, {
  name: 'MissingPostTags',
  description: 'Missing Post Tags',
});

registerEnumType(NOTIFICATION_CONTENT_TYPES, {
  name: 'NOTIFICATION_CONTENT_TYPES',
});
registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'Upvote or downvote a post or Comment',
});

registerEnumType(MissingPostTypes, {
  name: 'MissingPostTypes',
  description: 'Either missing, found, rescued, or all',
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
