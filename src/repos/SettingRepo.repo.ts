import { UserSetting } from './../entity/Settings/UserSettings';
import { Setting } from '../entity/Settings/Settings';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/UserEntities/User';

@Service()
@EntityRepository(Setting)
export class SettingRepo extends Repository<Setting> {
  /* Settings that must each user have:
        1. account-url
        2. show-email
        3. show-phone-number
        4. Language
        6. GetMissingPetsNotifications
        7. GetLostPetsNotifications
        8. GetMissingPetsEmails
        9. GetLostPetsEmails
    */
  private async createUniqueAccountURL(
    user: User,
    tries: number
  ): Promise<string> {
    let suffix = '';
    if (tries > 0) {
      suffix = new Date().getTime().toString().slice(0, 7);
    }

    const uniqueURL =
      user.full_name.toLocaleLowerCase().replace(' ', '-') + '-' + suffix;

    const accountURL = await UserSetting.findOne({ accountURL: uniqueURL });

    if (accountURL) {
      return this.createUniqueAccountURL(user, tries + 1);
    }
    return uniqueURL;
  }

  public async createDefaultUserSettings(user: User) {
    return UserSetting.create({
      user,
      showEmail: true,
      showPhone: true,
      language: 'EN',
      accountURL: await this.createUniqueAccountURL(user, 0),
    }); //
  }
}
