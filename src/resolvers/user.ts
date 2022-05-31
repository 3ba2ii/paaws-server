import { UserRepo } from './../repos/User.repo';
import { Upload } from './../types/Upload';
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
import { getConnection } from 'typeorm';
import { Photo } from '../entity/MediaEntities/Photo';
import { Pet } from '../entity/PetEntities/Pet';
import { User } from '../entity/UserEntities/User';
import { UserTag } from '../entity/UserEntities/UserTags';
import { UserTagsType } from '../types/enums.types';
import {
  FindNearestUsersInput,
  UpdateUserInfo,
  WhereClause,
} from '../types/input.types';
import { PaginatedUsers } from '../types/response.types';
import { createBaseResolver } from '../utils/createBaseResolver';
import { getDisplayName } from '../utils/getDisplayName';
import { Notification } from './../entity/Notification/Notification';
import { isAuth } from './../middleware/isAuth';
import { AddressRepo } from './../repos/AddressRepo.repo';
import { NotificationRepo } from './../repos/NotificationRepo.repo';
import { MyContext } from './../types';

require('dotenv-safe').config();

const UserBaseResolver = createBaseResolver('User', User);

@Resolver(User)
class UserResolver extends UserBaseResolver {
  constructor(
    private readonly notificationRepo: NotificationRepo,
    private readonly addressRepo: AddressRepo,
    private readonly userRepo: UserRepo
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

  @FieldResolver(() => Int)
  totalPostsCount(@Root() user: User): number {
    return user.adoptionPostsCount + user.missingPostsCount || 0;
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    return User.findOne(req.session.userId);
  }

  @Query(() => [Notification])
  @UseMiddleware(isAuth)
  notifications(@Ctx() { req }: MyContext): Promise<Notification[]> {
    const { userId } = req.session;

    return this.notificationRepo.getNotificationsByUserId(userId as number);
  }

  @Query(() => PaginatedUsers)
  async users(
    @Arg('where', () => WhereClause)
    { cursor, limit }: WhereClause
  ): Promise<PaginatedUsers> {
    // 20 -> 21

    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];
    if (cursor) replacements.push(new Date(cursor));

    const users = await getConnection().query(
      `
        select * from public."user"
        ${cursor ? 'where "createdAt" < $2' : ''}
        order by "createdAt" DESC
        limit $1;
    `,
      replacements
    );
    return {
      users: users.slice(0, realLimit),
      hasMore: users.length === realLimitPlusOne,
    };
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  user(@Arg('id', () => Int) id: number): Promise<User | undefined> {
    return User.findOne(id);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async addUserTag(
    @Arg('tag', () => UserTagsType) tag: UserTagsType,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const user = await User.findOne(req.session.userId);
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
  async updateUser(
    @Arg('updateOptions') updateOptions: UpdateUserInfo,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const user = await User.findOne(req.session.userId);
    if (!user) return false;

    return this.userRepo.updateUser(updateOptions, user);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async addUserAvatar(
    @Arg('avatar', () => GraphQLUpload) avatar: Upload,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const userId = req.session.userId;
    if (!userId) return false;
    const user = await User.findOne(userId);

    if (!user) return false;
    return this.userRepo.setUserAvatar(user, avatar);
  }

  @Query(() => [User], { nullable: true })
  getNearestUsers(
    @Arg('options') { lat, lng, radius }: FindNearestUsersInput
  ): Promise<User[]> {
    return this.addressRepo.findNearestUsers(lat, lng, radius);
  }
}

export default UserResolver;
