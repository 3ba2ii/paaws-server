import { AWSS3 } from './../utils/s3';
import { CREATE_NOT_FOUND_ERROR, INTERNAL_SERVER_ERROR } from './../errors';
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
import { Photo } from '../entity/MediaEntities/Photo';
import { User } from '../entity/UserEntities/User';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import {
  CreateImageResponse,
  S3URLResponse,
  UploadImageResponse,
} from '../types/responseTypes';
import { Upload } from '../types/Upload';
import { PhotoRepo } from '../repos/PhotoRepo.repo';

@Resolver(Photo)
class PhotoResolver {
  constructor(private readonly photoRepo: PhotoRepo) {}

  @FieldResolver()
  url(@Root() photo: Photo): string | null {
    if (!photo || !photo?.path) return null;
    return `${process.env.APP_URL}/images/${photo.path}`;
  }

  async createPhoto(
    @Arg('image', () => GraphQLUpload) { filename }: Upload,
    @Ctx() { req }: MyContext
  ): Promise<CreateImageResponse> {
    const userId = req.session.userId;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return {
        errors: [CREATE_NOT_FOUND_ERROR('user')],
      };
    }
    return this.photoRepo.createPhotoObject({ creator: user, filename });
  }

  @Mutation(() => UploadImageResponse)
  @UseMiddleware(isAuth)
  async uploadAvatar(
    @Arg('image', () => GraphQLUpload)
    uploadProps: Upload,
    @Ctx() ctx: MyContext
  ): Promise<UploadImageResponse> {
    //
    const { metadata, errors } = await this.createPhoto(uploadProps, ctx);
    if (errors?.length || !metadata) {
      return { errors };
    }
    const { photo: avatar, creator: user, uniqueFileName } = metadata;

    //assign avatar to the user
    user.avatar = avatar;

    const success = await getConnection().transaction(async () => {
      //writing to the local server
      //1. save the image first
      const saved = await this.photoRepo.saveImageToDisk(metadata, uploadProps);
      if (!saved) {
        return false;
      }

      //save the object to db
      await user.save();
      return true;
    });
    if (success)
      return {
        url: `http://localhost:4000/images/${uniqueFileName}`,
      };

    //failed to write to the local server
    return {
      errors: [INTERNAL_SERVER_ERROR],
    };
  }
  @Query(() => S3URLResponse)
  @UseMiddleware(isAuth)
  async getS3URL(): Promise<S3URLResponse> {
    const S3 = new AWSS3();
    return S3.generateUploadUrl();
  }
}
export default PhotoResolver;
