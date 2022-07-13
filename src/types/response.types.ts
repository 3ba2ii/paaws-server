import { OwnedPet } from '../entity/PetEntities/OwnedPet';
import { ClassType, Field, Int, ObjectType } from 'type-graphql';
import { Pet } from '../entity/PetEntities/Pet';
import { AdoptionPost } from '../entity/PostEntities/AdoptionPost';
import { User } from '../entity/UserEntities/User';
import { Comment } from '../entity/InteractionsEntities/Comment';
import { Photo } from '../entity/MediaEntities/Photo';
import { MissingPost } from '../entity/PostEntities/MissingPost';

function PaginatedResponse<T>(fieldName: string, TClass: ClassType<T>) {
  @ObjectType(`Paginated${TClass.name}Response`, { isAbstract: true })
  abstract class GenericPaginatedResponse extends ErrorResponse {
    @Field(() => [TClass], { name: fieldName || 'items', defaultValue: [] })
    items?: InstanceType<typeof TClass>[];

    @Field({ defaultValue: false })
    hasMore?: boolean;
  }
  return GenericPaginatedResponse;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;

  @Field(() => Int)
  code!: number;
}
@ObjectType()
export class ErrorResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
export class PaginatedUsers extends ErrorResponse {
  @Field(() => [User])
  users: User[];

  @Field()
  hasMore: boolean;
}

@ObjectType()
export class UserResponse extends ErrorResponse {
  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class RegularResponse extends ErrorResponse {
  @Field(() => Boolean, { defaultValue: false })
  success: boolean;
}

@ObjectType()
export class PetResponse extends ErrorResponse {
  @Field(() => Pet, { nullable: true })
  pet?: Pet;
}

@ObjectType()
export class AdoptionPostResponse extends ErrorResponse {
  @Field(() => AdoptionPost, { nullable: true })
  adoptionPost?: AdoptionPost;
}

@ObjectType()
export class PaginatedAdoptionPosts extends ErrorResponse {
  @Field(() => [AdoptionPost])
  posts: AdoptionPost[];

  @Field()
  hasMore: boolean;
}

@ObjectType()
export class ChangePasswordResponse extends ErrorResponse {
  @Field(() => Boolean, { defaultValue: false })
  success: boolean = false;
}

@ObjectType()
export class CreateMissingPostResponse extends ErrorResponse {
  @Field(() => MissingPost, { nullable: true })
  post?: MissingPost;
}

@ObjectType()
export class DeleteMissingPostResponse extends ErrorResponse {
  @Field(() => MissingPost, { nullable: true })
  deletedPost?: MissingPost;
}

@ObjectType()
export class DeleteResponse extends ErrorResponse {
  @Field()
  deleted: boolean;
}

@ObjectType()
export class ImageMetaData {
  @Field(() => Photo)
  photo: Photo;

  @Field(() => User)
  creator: User;

  @Field()
  pathName: string;

  @Field()
  uniqueFileName: string;
} //
@ObjectType()
export class CreateImageResponse extends ErrorResponse {
  @Field(() => ImageMetaData, { nullable: true })
  metadata?: ImageMetaData;
}

@ObjectType()
export class CommentResponse extends ErrorResponse {
  @Field(() => Comment, { nullable: true })
  comment?: Comment;
}

@ObjectType()
export class PaginatedComments extends PaginatedResponse('comments', Comment) {}

@ObjectType()
export class PaginatedReplies extends PaginatedResponse('replies', Comment) {}

@ObjectType()
export class VotingResponse extends ErrorResponse {
  @Field(() => Boolean, { defaultValue: false })
  success: boolean = false;
}

@ObjectType()
export class PaginatedMissingPosts extends PaginatedResponse(
  'missingPosts',
  MissingPost
) {}
@ObjectType()
export class UploadImageResponse extends ErrorResponse {
  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  filename?: string;
}

@ObjectType()
export class ImageObjectResponse extends ErrorResponse {
  @Field(() => Photo)
  photo?: Photo;
}
@ObjectType()
export class ValidateImageResponse extends ErrorResponse {
  valid: boolean = false;
  type?: string;
}

@ObjectType()
export class MissingPostResponse extends ErrorResponse {
  @Field(() => MissingPost, { nullable: true })
  missingPost?: MissingPost;

  @Field(() => Boolean, { defaultValue: false, nullable: true })
  isOwner?: boolean = false;
}

@ObjectType()
export class EditMissingPostResponse extends ErrorResponse {
  @Field(() => MissingPost, { nullable: true })
  missingPost?: MissingPost;
}

@ObjectType()
export class CreateUserOwnedPetResponse extends ErrorResponse {
  @Field(() => OwnedPet, { nullable: true })
  ownedPet?: OwnedPet;
}

@ObjectType()
export class PaginatedUserOwnedPetsResponse extends PaginatedResponse(
  'ownedPets',
  OwnedPet
) {}

@ObjectType()
export class BooleanResponseType extends ErrorResponse {
  @Field(() => Boolean, { nullable: true })
  response?: boolean;
}
