import { createWriteStream } from 'fs';
import { GraphQLUpload } from 'graphql-upload';
import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
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
import { createBaseResolver } from '../utils/createBaseResolver';
import { Address } from './../entity/Address';
import { PostUpdoot } from './../entity/InteractionsEntities/PostUpdoot';
import { Photo } from './../entity/MediaEntities/Photo';
import { PostImages } from './../entity/MediaEntities/PostImages';
import { MissingPost } from './../entity/PostEntities/MissingPost';
import { User } from './../entity/UserEntities/User';
import { PhotoRepo } from './../repos/PhotoRepo';

const MissingPostBaseResolver = createBaseResolver('MissingPost', MissingPost);

@Resolver(MissingPost)
class MissingPostResolver extends MissingPostBaseResolver {
  constructor(private readonly photoRepo: PhotoRepo) {
    super();
  }

  @FieldResolver(() => User)
  user(
    @Root() { userId }: MissingPost,
    @Ctx() { dataLoaders: { userLoader } }: MyContext
  ): Promise<User> {
    return userLoader.load(userId);
  }

  @Query(() => [MissingPost])
  async missingPosts(): Promise<MissingPost[]> {
    return MissingPost.find({ order: { createdAt: 'DESC' } });
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
    //
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

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    /* There is two cases to cover here
     *  1. User has not voted for this post before -> Create a new vote and increase/decrease the points by one (TRANSACTION)
     *  2. User has voted for this post
     *    * 2.1 User has changed his vote -> Update the current vote and increase/decrease the points by two (TRANSACTION)
     *    * 2.2 User has not changed his vote -> Do Nothing
     * */

    //check if value is only 1 or -1
    if (value !== 1 && value !== -1) return false;

    const { userId } = req.session;
    const post = await MissingPost.findOne(postId);
    if (!post) {
      return false;
    }
    const updoot = await PostUpdoot.findOne({ where: { postId, userId } });

    const conn = getConnection();

    if (!updoot) {
      //1. User has not voted for this post before
      const newUpdoot = PostUpdoot.create({
        postId,
        userId,
        value,
      });
      post.points += value;
      await conn.transaction(async (_) => {
        await newUpdoot.save();
        await post.save();
      });

      await conn.transaction(async (_trx) => {});
    } else {
      //2 User has voted for this post before
      if (updoot.value !== value) {
        //case 2.1 User has changed his vote

        //2.1.1 Update the current updoot value to the new value
        updoot.value = value;
        //2.2.2 Increase/decrease the points of the post by two
        post.points += 2 * value;

        //2.1.3 Save the updoot and post using transaction
        await conn.transaction(async (_trx) => {
          await updoot.save();
          await post.save();
        });
      } else {
        //case 2.2 User has not changed his vote
        return false;
      }
    }

    return true;
  }
}

export default MissingPostResolver;
