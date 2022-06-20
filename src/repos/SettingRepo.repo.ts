import { RegularResponse } from 'src/types/response.types';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { Setting } from '../entity/Settings/Settings';
import { User } from '../entity/UserEntities/User';
import { UserSetting } from './../entity/Settings/UserSettings';
import {
  CREATE_ALREADY_EXISTS_ERROR,
  CREATE_NOT_FOUND_ERROR,
  INTERNAL_SERVER_ERROR,
} from './../errors';
import { UpdateUserSettingsInput } from './../types/input.types';

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

  private trimAndLower(str: string) {
    return str.trim().toLocaleLowerCase().replace(' ', '');
  }

  public async isValidAccountURL(accountURL: string): Promise<boolean> {
    const trimmedURL = this.trimAndLower(accountURL);

    const us = await UserSetting.findOne({ accountURL: trimmedURL });

    return us ? false : true;
  }

  public async updateUserSettingsURL(
    userId: number,
    accountURL: string
  ): Promise<RegularResponse> {
    const userSettings = await UserSetting.findOne({ where: { userId } });
    if (!userSettings) {
      return {
        success: false,
        errors: [
          CREATE_NOT_FOUND_ERROR('user-settings', 'No user settings found'),
        ],
      };
    }
    //check if its the same account URL
    if (userSettings.accountURL === accountURL) {
      return {
        success: false,
        errors: [
          {
            code: 401,
            field: 'accountURL',
            message: 'The account url is the same as before',
          },
        ],
      };
    }

    //check if the account URL is a valid one (Not duplicated)
    const isValid = await this.isValidAccountURL(accountURL);
    if (!isValid) {
      return {
        success: false,
        errors: [
          CREATE_ALREADY_EXISTS_ERROR(
            'accountURL',
            'This account URL is already in use.'
          ),
        ],
      };
    }
    userSettings.accountURL = this.trimAndLower(accountURL);

    try {
      await userSettings.save();
      return { success: true };
    } catch (e) {
      return { success: false, errors: [e, INTERNAL_SERVER_ERROR] };
    }
  }

  public async updateUserSettings(
    userId: number,
    updateSettingsInput: UpdateUserSettingsInput
  ): Promise<RegularResponse> {
    const userSettings = await UserSetting.findOne({ where: { userId } });
    if (!userSettings) {
      return {
        success: false,
        errors: [
          CREATE_NOT_FOUND_ERROR('user-settings', 'No user settings found'),
        ],
      };
    }
    if (typeof updateSettingsInput.showEmail === 'boolean') {
      userSettings.showEmail = updateSettingsInput.showEmail;
    }
    if (typeof updateSettingsInput.showPhoneNumber === 'boolean') {
      userSettings.showPhone = updateSettingsInput.showPhoneNumber;
    }
    if (typeof updateSettingsInput.language === 'string') {
      userSettings.language = updateSettingsInput.language;
    }

    try {
      await userSettings.save();
      return { success: true };
    } catch (e) {
      return { success: false, errors: [e, INTERNAL_SERVER_ERROR] };
    }
  }
}
