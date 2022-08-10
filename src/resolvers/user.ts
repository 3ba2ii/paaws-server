import {
  UserMetadata,
  UserMetadataDescription,
} from './../entity/Metadata/UserMetadata';
import { GraphQLUpload } from 'graphql-upload';
import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection, LessThan } from 'typeorm';
import { v4 } from 'uuid';
import { AUTH_TOKEN_PREFIX } from '../constants';
import { Photo } from '../entity/MediaEntities/Photo';
import { Pet } from '../entity/PetEntities/Pet';
import { User } from '../entity/UserEntities/User';
import { UserTag } from '../entity/UserEntities/UserTags';
import { isAuthorized } from '../middleware/isAuthorized';
import { UserTagsType } from '../types/enums.types';
import {
  FindNearestUsersInput,
  PaginationArgs,
  UpdateUserInfo,
} from '../types/input.types';
import {
  BooleanResponseType,
  PaginatedMissingPosts,
  RegularResponse,
} from '../types/response.types';
import { createBaseResolver } from '../utils/createBaseResolver';
import { getDisplayName } from '../utils/getDisplayName';
import { sendEmail } from '../utils/sendEmail';
import { CHANGE_EMAIL_PREFIX } from './../constants';
import { PostUpdoot } from './../entity/InteractionsEntities/PostUpdoot';
import { Notification } from './../entity/Notification/Notification';
import { AdoptionPost } from './../entity/PostEntities/AdoptionPost';
import { MissingPost } from './../entity/PostEntities/MissingPost';
import {
  CREATE_ALREADY_EXISTS_ERROR,
  CREATE_INVALID_ERROR,
  CREATE_NOT_FOUND_ERROR,
  INTERNAL_SERVER_ERROR,
} from './../errors';
import { isAuth } from './../middleware/isAuth';
import { isUserFound } from './../middleware/isUserFound';
import { AddressRepo } from './../repos/AddressRepo.repo';
import { NotificationRepo } from './../repos/NotificationRepo.repo';
import { SettingRepo } from './../repos/SettingRepo.repo';
import { UserRepo } from './../repos/User.repo';
import { MyContext } from './../types';
import { AuthorizationInputType } from './../types/authorization.types';
import { Upload } from './../types/Upload';

require('dotenv-safe').config();

export type ChangeEmailRedisValue = {
  email: string;
  userId: number;
  timestamp: Date;
};

const UserBaseResolver = createBaseResolver('User', User);

@Resolver(User)
class UserResolver extends UserBaseResolver {
  constructor(
    private readonly notificationRepo: NotificationRepo,
    private readonly addressRepo: AddressRepo,
    private readonly userRepo: UserRepo,
    private readonly settingsRepo: SettingRepo
  ) {
    super();
  }

  @FieldResolver(() => String)
  displayName(@Root() { full_name }: User): string {
    return getDisplayName(full_name);
  }

  @FieldResolver(() => Photo, { nullable: true })
  async avatar(
    @Root() { avatarId }: User,
    @Ctx() { dataLoaders: { photoLoader } }: MyContext
  ): Promise<Photo | undefined> {
    if (!avatarId) return undefined;

    return photoLoader.load(avatarId);
  }

  @FieldResolver(() => [Pet])
  pets(@Root() user: User): Promise<Pet[] | undefined> {
    return Pet.find({ where: { user } });
  }
  @FieldResolver(() => [PostUpdoot])
  async updoots(@Root() user: User): Promise<PostUpdoot[]> {
    return PostUpdoot.find({ where: { user }, relations: ['post'] });
  }

  @FieldResolver(() => Int)
  async totalPostsCount(@Root() user: User): Promise<number> {
    const missingCount = await MissingPost.count({
      where: { userId: user.id },
    });
    const adoptionCount = await AdoptionPost.count({
      where: { userId: user.id },
    });
    return missingCount + adoptionCount;
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isUserFound)
  me(@Ctx() { req }: MyContext): User | undefined {
    return req.session.user;
  }

  @Query(() => [Notification])
  @UseMiddleware(isAuth)
  @UseMiddleware(isUserFound)
  notifications(@Ctx() { req }: MyContext): Promise<Notification[]> {
    return this.notificationRepo.getNotificationsByUserId(
      req.session.userId as number
    );
  }

  @Query(() => User, { nullable: true })
  //@UseMiddleware(isAuth)
  user(@Arg('id', () => Int) id: number): Promise<User | undefined> {
    return User.findOne(id);
  }

  @Query(() => PaginatedMissingPosts)
  @UseMiddleware(isAuth)
  async votes(
    @Arg('userId', () => Int) userId: number,
    @Arg('paginationArgs', { nullable: true }) { limit, cursor }: PaginationArgs
  ): Promise<PaginatedMissingPosts> {
    const raelLimit = Math.min(20, limit || 5);
    const realLimitPlusOne = raelLimit + 1;

    const votesRepo = getConnection().getRepository(PostUpdoot);

    const updoots = await votesRepo.find({
      where: {
        userId,
        createdAt: LessThan(cursor ? new Date(cursor) : new Date()),
      },
      relations: ['post'],
      take: realLimitPlusOne,
      order: { createdAt: 'DESC' },
    });

    return {
      items: updoots.map((v) => v.post).slice(0, raelLimit),
      hasMore: updoots.length === realLimitPlusOne,
    };
  }

  @Mutation(() => RegularResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isUserFound)
  async updateUserFullName(
    @Arg('fullName') fullName: string,
    @Ctx() { req }: MyContext
  ): Promise<RegularResponse> {
    const user = req.session.user;
    if (!user) {
      return { success: false, errors: [CREATE_NOT_FOUND_ERROR('user')] };
    }
    return this.userRepo.updateUserFullName(user, fullName);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isUserFound)
  async addUserTag(
    @Arg('tag', () => UserTagsType) tag: UserTagsType,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const user = req.session!.user;
    const newTag = UserTag.create({ user, tagName: tag });

    try {
      await getConnection().manager.insert(UserTag, newTag);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isUserFound)
  async updateUser(
    @Arg('updateOptions') updateOptions: UpdateUserInfo,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const user = req.session.user;
    return !user ? false : this.userRepo.updateUser(updateOptions, user);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isUserFound)
  async addUserAvatar(
    @Arg('avatar', () => GraphQLUpload) avatar: Upload,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const user = req.session.user;
    return !user ? false : this.userRepo.setUserAvatar(user, avatar);
  }

  @Query(() => BooleanResponseType)
  @UseMiddleware(isAuth)
  async isEmailVerified(
    @Ctx() { req }: MyContext
  ): Promise<BooleanResponseType> {
    return req.session.userId
      ? this.settingsRepo.isEmailVerified(req.session.userId)
      : { errors: [CREATE_NOT_FOUND_ERROR('user')] };
  }

  @Mutation(() => BooleanResponseType)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAuthorized)
  async sendChangeUserEmailEmail(
    @Arg('email') email: string,
    @Arg('authToken') authToken: string,
    @Arg('authAction') _authAction: string,
    @Ctx() { req, redis }: MyContext
  ): Promise<BooleanResponseType> {
    if (!req.session.userId) {
      return { response: false, errors: [CREATE_NOT_FOUND_ERROR('user')] };
    }
    /* delete the old authToken */
    const authTokenRedisKey = `${AUTH_TOKEN_PREFIX}:${authToken}`;

    const authValue = await redis.get(authTokenRedisKey);

    if (!authValue) {
      return { response: false, errors: [CREATE_NOT_FOUND_ERROR('authToken')] };
    }

    //check wether the old authValue which holds the action and userId is the same as the one in the session
    const { action, userId } = JSON.parse(authValue) as AuthorizationInputType;

    if (action !== CHANGE_EMAIL_PREFIX || userId !== req.session.userId) {
      return {
        response: false,
        errors: [
          CREATE_INVALID_ERROR('action'),
          CREATE_INVALID_ERROR('userId'),
        ],
      };
    }

    await redis.del(authTokenRedisKey);

    const user = await User.findOne(req.session.userId);
    if (!user) {
      return { response: false, errors: [CREATE_NOT_FOUND_ERROR('user')] };
    }
    //check if email is already in use
    const userWithEmail = await User.findOne({ where: { email } });
    if (userWithEmail) {
      return {
        response: false,
        errors: [CREATE_ALREADY_EXISTS_ERROR('email')],
      };
    }

    //check if its the same email
    if (user.email.toLowerCase().trim() === email.toLowerCase().trim()) {
      return {
        response: false,
        errors: [
          CREATE_ALREADY_EXISTS_ERROR(
            'email',
            'New email is the same as the current one'
          ),
        ],
      };
    }
    //send email to user
    const changeEmailVerificationCode = await v4();
    const redisKey = `${CHANGE_EMAIL_PREFIX}:${changeEmailVerificationCode}`;
    const reidValue = JSON.stringify({
      email,
      userId: user.id,
      timestamp: new Date(),
    });

    await redis.set(redisKey, reidValue, 'ex', 60 * 60 * 0.1); //10 mins

    //send email with that redis key
    const changeEmailLink = `${process.env.CORS_ORIGIN}/change-email/${changeEmailVerificationCode}`;
    const emailHTML = `<a href="${changeEmailLink}">${changeEmailLink}</a>`;
    await sendEmail(email, emailHTML, 'Change Email');

    return { response: true };
  }

  @Mutation(() => BooleanResponseType)
  @UseMiddleware(isAuth)
  async changeUserEmail(
    @Arg('token') token: string,
    @Ctx() { req, redis }: MyContext
  ): Promise<BooleanResponseType> {
    try {
      const redisKey = `${CHANGE_EMAIL_PREFIX}:${token}`;
      const redisValue = await redis.get(redisKey);
      if (!redisValue) {
        return { response: false, errors: [CREATE_NOT_FOUND_ERROR('token')] };
      }

      const { email, userId, timestamp } = JSON.parse(
        redisValue
      ) as ChangeEmailRedisValue;

      if (!email || !userId || !timestamp) {
        return { response: false, errors: [CREATE_INVALID_ERROR('token')] };
      }
      if (req.session?.userId !== userId) {
        return {
          response: false,
          errors: [
            CREATE_INVALID_ERROR(
              'token',
              'Logged in user is not the same as the user who requested the change'
            ),
          ],
        };
      }

      /* check if email already exists */
      const userWithEmail = await User.findOne({ where: { email } });
      if (userWithEmail) {
        return {
          response: false,
          errors: [CREATE_ALREADY_EXISTS_ERROR('email')],
        };
      }

      const user = await User.findOne(req.session.userId, {
        relations: ['settings'],
      });
      if (!user) {
        return { response: false, errors: [CREATE_NOT_FOUND_ERROR('user')] };
      }

      const oldEmail = user.email;
      const metadata = UserMetadata.create({
        user,
        description: UserMetadataDescription.UPDATE_EMAIL,
        value: oldEmail,
      });
      user.email = email.trim().toLowerCase();
      user.settings.emailVerified = true;

      await user.save();
      await metadata.save();
      await redis.del(redisKey);
      //todo: must send a notification to old email and new email
      return { response: true };
    } catch (e) {
      return { response: false, errors: [INTERNAL_SERVER_ERROR, e] };
    }
  }

  @Query(() => [User], { nullable: true })
  getNearestUsers(
    @Arg('options') { lat, lng, radius }: FindNearestUsersInput
  ): Promise<User[]> {
    return this.addressRepo.findNearestUsers(lat, lng, radius);
  }
}

export default UserResolver;
