import { createWriteStream } from 'fs';
import { GraphQLUpload } from 'graphql-upload';
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import { CreateMissingPostInput } from '../types/inputTypes';
import { CreateMissingPostResponse } from '../types/responseTypes';
import { Upload } from '../types/Upload';
import { Address } from './../entity/Address';
import { Photo } from './../entity/MediaEntities/Photo';
import { PostImages } from './../entity/MediaEntities/PostImages';
import { MissingPost } from './../entity/PostEntities/MissingPost';
import { User } from './../entity/UserEntities/User';
import { PhotoRepo } from './../repos/PhotoRepo';

@Resolver(MissingPost)
class MissingPostResolver {
  constructor(private readonly photoRepo: PhotoRepo) {}

  @FieldResolver(() => User)
  user(
    @Root() { userId }: MissingPost,
    @Ctx() { dataLoaders: { userLoader } }: MyContext
  ): Promise<User> {
    return userLoader.load(userId);
  }

  @Query(() => [MissingPost])
  async missingPosts(): Promise<MissingPost[]> {
    return MissingPost.find();
  }

  @Mutation(() => CreateMissingPostResponse)
  @UseMiddleware(isAuth)
  async createMissingPost(
    @Ctx() { req }: MyContext,
    @Arg('input')
    {
      address,
      description,
      privacy,
      title,
      type,
      thumbnailIdx,
    }: CreateMissingPostInput,
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
    const resolvedStreams = await this.photoRepo.getMultipleImagesStreams(
      images
    );
    const postImages = resolvedStreams.map(
      ({ filename, uniqueFileName }, idx) => {
        let isThumbnail = false;
        if (thumbnailIdx && thumbnailIdx === idx) {
          isThumbnail = true;
        }
        return PostImages.create({
          photo: Photo.create({
            filename,
            path: uniqueFileName,
            creator: user,
            isThumbnail,
          }),
        });
      }
    );

    //4. Associate the thumbnail if exists
    if (typeof thumbnailIdx === 'number')
      missingPost.thumbnail = postImages[thumbnailIdx].photo;

    missingPost.images = postImages;

    //4. save the post and the images
    const success = await getConnection().transaction(async (_) => {
      await Promise.all(
        resolvedStreams.map((s) => {
          const { stream, pathName } = s;

          return stream.pipe(createWriteStream(pathName));
        })
      );
      await missingPost.save();
      return true;
    });

    if (!success)
      return {
        errors: [
          { code: 500, message: 'Internal Server Error', field: 'server' },
        ],
      };

    //TODO:  create notification to nearest 20 users that there is a missing pet
    return { post: missingPost };
  }
}

export default MissingPostResolver;
//
