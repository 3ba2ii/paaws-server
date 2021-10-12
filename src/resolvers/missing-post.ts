import { AddressInput, MissingPetInput } from './../types/inputTypes';
import { Field, InputType, ObjectType, Query, Resolver } from 'type-graphql';
import { MissingPost } from './../entity/PostEntities/MissingPost';
import { FieldError } from './../types/responseTypes';

@ObjectType()
export class CreateMissingPostResponse {
  @Field(() => MissingPost)
  post: MissingPost;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@InputType()
export class CreateMissingPostInput {
  @Field(() => MissingPetInput)
  petInfo: MissingPetInput;

  @Field(() => AddressInput, { nullable: true })
  address?: AddressInput;
}

@Resolver(MissingPost)
class MissingPostResolver {
  @Query(() => [MissingPost])
  missingPosts(): Promise<MissingPost[]> {
    return MissingPost.find();
  }
  /* 
  @Mutation(() => CreateMissingPostResponse)
  @UseMiddleware(isAuth)
  async createMissingPost(
    { req }: MyContext,
    @Arg('input') { petInfo, address }: CreateMissingPostInput
  ): Promise<CreateMissingPostResponse> {
    const userId = req.session.userId;
    //
  } */
}

export default MissingPostResolver;
//
