import { Photo } from './../entity/Photo';
import {
  Resolver,
  Query,
  FieldResolver,
  Root,
  Arg,
  Ctx,
  Mutation,
  UseMiddleware,
} from 'type-graphql';
import { createWriteStream } from 'fs';
import { GraphQLUpload } from 'graphql-upload';
import path from 'path';
import { User } from '../entity/User';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import { UploadImageResponse } from '../types/responseTypes';
import { Upload } from '../types/Upload';
import { generateRandomString } from '../utils/generateRandomString';
import { getConnection } from 'typeorm';

@Resolver(Photo)
class PhotoResolver {
  @FieldResolver()
  url(@Root() photo: Photo): string | null {
    if (!photo || !photo?.path) return null;
    return `${process.env.APP_URL}/images/${photo.path}`;
  }
  @Query(() => [Photo])
  async photos(): Promise<Photo[]> {
    const photos = await Photo.find();
    return photos;
  }

  @Mutation(() => UploadImageResponse)
  @UseMiddleware(isAuth)
  async uploadAvatar(
    @Arg('image', () => GraphQLUpload) { createReadStream, filename }: Upload,
    @Ctx() { req }: MyContext
  ): Promise<UploadImageResponse> {
    const userId = req.session.userId;
    const user = await User.findOne({ id: userId });
    if (!user)
      return {
        errors: [
          {
            field: 'user',
            message: 'User not found',
            code: 404,
          },
        ],
      }; //
    const randomName = generateRandomString(12);
    const uniqueFileName = `${randomName}-${new Date().toISOString()}-${filename}`;
    const pathName = path.join(
      __dirname,
      '../',
      `public/images/${uniqueFileName}`
    ); //

    const stream = createReadStream();

    const avatar = Photo.create({
      creator: user,
      filename,
      path: uniqueFileName,
      isOnDisk: true,
    });

    user.avatar = avatar;

    const success = await getConnection().transaction(
      async (_transactionalEntityManager) => {
        //writing to the local server
        await stream.pipe(createWriteStream(pathName));

        await user.save();
        return true;
      }
    );

    if (success)
      return {
        url: `http://localhost:4000/images/${uniqueFileName}`,
      };
    return {
      errors: [
        {
          field: 'image',
          message: 'Error uploading image',
          code: 500,
        },
      ],
    };
  }
}
export default PhotoResolver;
