import { GraphQLUpload } from 'graphql-upload';
import { Arg, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import { CreateMissingPostInput } from '../types/inputTypes';
import { CreateMissingPostResponse } from '../types/responseTypes';
import { Upload } from '../types/Upload';
import { Address } from './../entity/Address';
import { MissingPost } from './../entity/PostEntities/MissingPost';
import { User } from './../entity/UserEntities/User';

@Resolver(MissingPost)
class MissingPostResolver {
  @Query(() => [MissingPost])
  async missingPosts(): Promise<MissingPost[]> {
    return MissingPost.find();
  }

  @Mutation(() => CreateMissingPostResponse)
  @UseMiddleware(isAuth)
  async createMissingPost(
    { req }: MyContext,
    @Arg('input')
    { address, description, privacy, title, type }: CreateMissingPostInput,
    @Arg('images', () => [GraphQLUpload]) images: Upload[]
  ): Promise<CreateMissingPostResponse> {
    const userId = req.session.userId;
    const user = await User.findOne(userId);
    if (!user)
      return {
        errors: [{ field: 'user', code: 404, message: 'User not found' }],
      };

    //1. Create the location
    const missingPost = MissingPost.create({
      title,
      description,
      type,
      privacy,
      user,
    });

    //todo: given the lng and lat, find the closest location if not provided
    //2. Create the address
    if (address) {
      const new_address = Address.create({
        ...address,
      });
      missingPost.address = new_address;
    }

    //3. Create the images
  }
}

export default MissingPostResolver;
//
