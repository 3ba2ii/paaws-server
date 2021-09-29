import { createWriteStream } from 'fs';
import { GraphQLUpload } from 'graphql-upload';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Photo } from '../entity/MediaEntities/Photo';
import { User } from '../entity/UserEntities/User';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import { UploadImageResponse } from '../types/responseTypes';
import { Upload } from '../types/Upload';
import { createImageMetaData } from '../utils/createImage';
import { FieldError } from './../types/responseTypes';

@ObjectType()
export class ImageMetaData {
  @Field(() => Photo)
  photo: Photo;

  @Field(() => User)
  user: User;

  @Field()
  pathName: string;

  @Field()
  uniqueFileName: string;
} //
@ObjectType()
class CreateImageResponse {
  @Field(() => ImageMetaData, { nullable: true })
  metadata?: ImageMetaData;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@Resolver(Photo)
class PhotoResolver {
  @FieldResolver()
  url(@Root() photo: Photo): string | null {
    if (!photo || !photo?.path) return null;
    return `${process.env.APP_URL}/images/${photo.path}`;
  }

  @Mutation(() => ImageMetaData)
  @UseMiddleware(isAuth)
  public async createPhoto(
    @Arg('image', () => GraphQLUpload) { filename }: Upload,
    @Ctx() { req }: MyContext
  ): Promise<CreateImageResponse> {
    const userId = req.session.userId;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return {
        errors: [
          {
            code: 404,
            field: 'user',
            message: 'User not found',
          },
        ],
      };
    }
    const { pathName, uniqueFileName } = createImageMetaData(filename);
    const photo = Photo.create({
      creator: user,
      filename,
      path: uniqueFileName,
      isOnDisk: true,
    });
    return {
      metadata: { photo, user, pathName, uniqueFileName },
    };
  }

  @Mutation(() => UploadImageResponse)
  @UseMiddleware(isAuth)
  async uploadAvatar(
    @Arg('image', () => GraphQLUpload)
    uploadProps: Upload,
    @Ctx() ctx: MyContext
  ): Promise<UploadImageResponse> {
    const { createReadStream } = uploadProps;
    const { metadata, errors } = await this.createPhoto(uploadProps, ctx);
    if (errors?.length || !metadata) {
      return { errors };
    }
    const { photo: avatar, user, pathName, uniqueFileName } = metadata;

    const stream = createReadStream();
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

    //failed to write to the local server
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
