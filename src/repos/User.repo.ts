import { Upload } from './../types/Upload';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/UserEntities/User';
import { PhotoRepo } from './PhotoRepo.repo';
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
}
