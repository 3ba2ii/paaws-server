import { CREATE_NOT_FOUND_ERROR } from './../errors';
import { User } from './../entity/UserEntities/User';
import { UpdateUserSettingsInput } from './../types/input.types';
import { RegularResponse } from './../types/response.types';
import { SettingRepo } from './../repos/SettingRepo.repo';
import { UserSetting } from './../entity/Settings/UserSettings';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

@Resolver(UserSetting)
class SettingsResolver {
  constructor(private readonly settingRepo: SettingRepo) {}

  @Query(() => UserSetting, { nullable: true })
  @UseMiddleware(isAuth)
  async mySettings(
    @Ctx() { req }: MyContext
  ): Promise<UserSetting | undefined> {
    const userId = req.session.userId;
    const user = await User.findOne(userId);
    if (!user || !userId) {
      throw new Error('User not found');
    }

    return UserSetting.findOne({ where: { userId } });
  }

  @Mutation(() => RegularResponse)
  @UseMiddleware(isAuth)
  async updateAccountURL(
    @Arg('accountURL') accountURL: string,
    @Ctx() { req }: MyContext
  ): Promise<RegularResponse> {
    const userId = req.session.userId;
    const user = await User.findOne(userId);
    if (!user || !userId)
      return { success: false, errors: [CREATE_NOT_FOUND_ERROR('user')] };

    return this.settingRepo.updateUserSettingsURL(userId, accountURL);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async isValidAccountURL(
    @Arg('accountURL') accountURL: string
  ): Promise<boolean> {
    return this.settingRepo.isValidAccountURL(accountURL);
  }

  @Mutation(() => RegularResponse)
  @UseMiddleware(isAuth)
  async updateUserSettings(
    @Arg('updateUserSettingsInput')
    updateUserSettingsInput: UpdateUserSettingsInput,
    @Ctx() { req }: MyContext
  ): Promise<RegularResponse> {
    const userId = req.session.userId;
    const user = await User.findOne(userId);
    if (!user || !userId)
      return { success: false, errors: [CREATE_NOT_FOUND_ERROR('user')] };

    return this.settingRepo.updateUserSettings(userId, updateUserSettingsInput);
  }
}

export default SettingsResolver;