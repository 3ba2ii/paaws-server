import { CREATE_INVALID_ERROR, INTERNAL_SERVER_ERROR } from './../errors';
import { RegularResponse } from '../types/response.types';
import {
  UserMetadata,
  UserMetadataDescription,
} from './../entity/Metadata/UserMetadata';
import { Upload } from './../types/Upload';
import { Service } from 'typedi';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { User } from '../entity/UserEntities/User';
import { PhotoRepo } from './PhotoRepo.repo';
import { UpdateUserInfo } from 'src/types/input.types';
@Service()
@EntityRepository(User)
export class UserRepo extends Repository<User> {
  constructor(private readonly photoRepo: PhotoRepo) {
    super();
  }
  public async updateUserFullName(
    user: User,
    fullName: string
  ): Promise<RegularResponse> {
    //find how many times did the user updated his full name
    const [updates, count] = await UserMetadata.findAndCount({
      where: { description: UserMetadataDescription.UPDATE_FULL_NAME, user },
    });
    //if updated more than 5 times, return errors
    if (count >= 5) {
      return {
        success: false,
        errors: [
          {
            code: 400,
            field: 'full_name',
            message: 'You can only update your name 5 times',
          },
        ],
      };
    }
    const lastUpdate = updates[updates.length - 1];
    //if the last update is less than 30 days, return errors
    if (
      lastUpdate &&
      lastUpdate.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000 >
        new Date().getTime()
    ) {
      return {
        success: false,
        errors: [
          {
            code: 400,
            field: 'full_name',
            message: 'You can only update your name once every 30 days',
          },
        ],
      };
    }

    if (fullName === '') {
      return {
        success: false,
        errors: [CREATE_INVALID_ERROR('full_name', 'Name cannot be empty')],
      };
    }

    if (fullName === user.full_name) {
      return {
        success: false,
        errors: [CREATE_INVALID_ERROR('full_name', 'Name cannot be the same')],
      };
    }

    if (fullName && fullName !== '') user.full_name = fullName;
    const metadata = UserMetadata.create({
      user,
      description: UserMetadataDescription.UPDATE_FULL_NAME,
      value: fullName,
    });
    try {
      await getConnection().transaction(async (_tm) => {
        await user.save();
        await metadata.save();
      });
      return { success: true };
    } catch (e) {
      return { success: false, errors: [e, INTERNAL_SERVER_ERROR] };
    }
  }

  public async setUserAvatar(user: User, avatar: Upload): Promise<boolean> {
    const { photo, errors } = await this.photoRepo.createPhoto(avatar, user.id);
    if (errors && errors.length > 0) {
      return false;
    }

    if (!photo) return false;

    user.avatar = photo;

    try {
      await user.save();
      return true;
    } catch (e) {
      return false;
    }
  }

  public async updateUser(
    updateOptions: UpdateUserInfo,
    user: User
  ): Promise<boolean> {
    const { bio, lat, lng, gender, birthDate } = updateOptions;

    if (bio && bio !== '') user.bio = bio;

    //update location
    if (lat && lng) {
      user.lat = lat;
      user.lng = lng;
    }

    if (gender) user.gender = gender;
    if (birthDate) user.birthDate = birthDate;

    await user.save().catch((err) => {
      console.log(`🚀 ~ file: user.ts ~ line 428 ~ UserResolver ~ err`, err);
      return false;
    });

    return true;
  }
}
