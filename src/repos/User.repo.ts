import { Upload } from './../types/Upload';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/UserEntities/User';
import { PhotoRepo } from './PhotoRepo.repo';
import { UpdateUserInfo } from 'src/types/input.types';
@Service()
@EntityRepository(User)
export class UserRepo extends Repository<User> {
  constructor(private readonly photoRepo: PhotoRepo) {
    super();
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

  //update user method
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
