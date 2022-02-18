import { GraphQLUpload } from 'graphql-upload';
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { Photo } from '../entity/MediaEntities/Photo';
import { User } from '../entity/UserEntities/User';
import { isAuth } from '../middleware/isAuth';
import { PhotoRepo } from '../repos/PhotoRepo.repo';
import { MyContext } from '../types';
import { UploadImageResponse } from '../types/response.types';
import { Upload } from '../types/Upload';
import { CREATE_NOT_FOUND_ERROR, INTERNAL_SERVER_ERROR } from './../errors';

@Resolver(Photo)
class PhotoResolver {
  constructor(private readonly photoRepo: PhotoRepo) {}

  @Mutation(() => UploadImageResponse)
  @UseMiddleware(isAuth)
  async uploadAvatar(
    @Arg('image', () => GraphQLUpload)
    uploadProps: Upload,
    @Ctx() ctx: MyContext
  ): Promise<UploadImageResponse> {
    const userId = ctx.req.session.userId;
    const user = await User.findOne({ id: userId });
    if (!user) return { errors: [CREATE_NOT_FOUND_ERROR('user')] };

    const { url, filename, errors } = await this.photoRepo.uploadToS3(
      uploadProps
    );
    if (errors?.length) return { errors: [INTERNAL_SERVER_ERROR, ...errors] };

    const avatar = Photo.create({
      creatorId: userId,
      url,
      filename: filename,
    });
    user.avatar = avatar;
    try {
      await user.save();
      return { url, filename };
    } catch (e) {
      console.log(`🚀 ~ file: photo.ts ~ line 73 ~ PhotoResolver ~ e`, e);
      //failed to write to the local server
      return {
        errors: [INTERNAL_SERVER_ERROR],
      };
    }
  }
}
export default PhotoResolver;
