import { RegularResponse } from '../types/response.types';
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

  @Mutation(() => RegularResponse)
  @UseMiddleware(isAuth)
  async removeAvatar(@Ctx() { req }: MyContext): Promise<RegularResponse> {
    const userId = req.session.userId;
    const user = await User.findOne(userId, { relations: ['avatar'] });

    if (!user) {
      return { success: false, errors: [CREATE_NOT_FOUND_ERROR('user')] };
    }
    if (!user.avatar || !user.avatarId) {
      return { success: false, errors: [CREATE_NOT_FOUND_ERROR('avatar')] };
    }
    try {
      //1. delete avatar from the database
      const avatar = await user.avatar.remove();
      if (!avatar) return { success: false, errors: [INTERNAL_SERVER_ERROR] };
      this.photoRepo.removeFromS3(avatar.filename);

      return { success: true };
    } catch (e) {
      return { success: false, errors: [INTERNAL_SERVER_ERROR, e] };
    }
  }
}
export default PhotoResolver;
