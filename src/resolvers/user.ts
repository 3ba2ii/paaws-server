import { Photo } from './../entity/Photo';
import argon2 from 'argon2';
import { Max, Min } from 'class-validator';
import { Pet } from '../entity/PetEntities/Pet';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { v4 } from 'uuid';
import {
  ChangePasswordInput,
  ChangePasswordResponse,
  FieldError,
  LoginInput,
  PaginatedUsers,
  RegisterOptions,
  RegularResponse,
  UserResponse,
} from '../types/responseTypes';
import { UserTagsType } from '../types/types';
import { checkDuplicationError } from '../utils/checkDuplicationError';
import { sendEmail } from '../utils/sendEmail';
import {
  COOKIE_NAME,
  FORGET_PASSWORD_PREFIX,
  VERIFY_PHONE_NUMBER_PREFIX,
} from './../constants';
import { User } from '../entity/UserEntities/User';
import { UserTag } from '../entity/UserEntities/UserTags';
import { isAuth } from './../middleware/isAuth';
import { MyContext } from './../types';
import { sendSMS } from './../utils/sendSMS';

require('dotenv-safe').config();

@InputType()
class UpdateUserInfo {
  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Max(80)
  @Min(-180)
  @Field({ nullable: true })
  lng?: number;

  @Max(90)
  @Min(-90)
  @Field({ nullable: true })
  lat?: number;
}

@InputType()
class WhereClause {
  @Field(() => Int, { nullable: true })
  limit: number;

  @Field({ nullable: true })
  cursor?: string;
}
@InputType()
class FindNearestUsersInput {
  @Field()
  lat!: number;

  @Field()
  lng!: number;

  @Field()
  radius!: number;
}

@Resolver(User)
class UserResolver {
  @FieldResolver(() => Photo, { nullable: true })
  async avatar(@Root() user: User): Promise<Photo | undefined> {
    if (!user.avatarId) return undefined;
    const userAvatar = await Photo.findOne(user.avatarId);

    return userAvatar;
  }

  @FieldResolver(() => [Pet])
  pets(@Root() user: User): Promise<Pet[] | undefined> {
    return Pet.find({ where: { user } });
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    return User.findOne(req.session.userId);
  }

  @Query(() => Int)
  async usersCount(): Promise<number> {
    return User.count();
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
          ${cursor ? `where "createdAt" < $2` : ''}
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

  @Query(() => User, {
    nullable: true,
  })
  @UseMiddleware(isAuth)
  user(@Arg('id', () => Int) id: number): Promise<User | undefined> {
    return User.findOne(id);
  }

  @Mutation(() => RegularResponse)
  async sendOTP(
    @Arg('phone') phone: string,
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ): Promise<RegularResponse> {
    //DONE 1. verify that this is a valid phone number
    //DONE 2. verify the phone number that is not already registered
    //DONE 3. send the otp to the phone number

    var otp = Math.floor(1000 + Math.random() * 9000);

    const phoneNumberRegExp = new RegExp(
      '^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$'
    );

    if (!phoneNumberRegExp.test(phone)) {
      return {
        success: false,
        errors: [
          {
            message: 'Phone number is not valid',
            field: 'phone',
            code: 400, // Bad Request Code
          },
        ],
      };
    }

    const user = await User.findOne({ where: [{ phone }, { email }] });

    if (user) {
      const errors: FieldError[] = [];
      if (user.email === email) {
        errors.push({
          message: 'Email is already associated with an account',
          field: 'email',
          code: 409, //Conflict Code
        });
      }
      if (user.phone === phone) {
        errors.push({
          message: 'Phone number is already registered',
          field: 'phone',
          code: 409, //Conflict Code
        });
      }
      return {
        success: false,
        errors,
      };
    }

    await redis.set(VERIFY_PHONE_NUMBER_PREFIX + phone, otp, 'ex', 60 * 10);
    const { sent } = await sendSMS(`Your OTP is ${otp}`, phone);
    if (!sent) {
      return {
        success: false,
        errors: [
          {
            field: 'phone',
            message: 'Sending OTP failed, Please try again later',
            code: 500,
          },
        ],
      };
    }

    return { success: true };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('registerOptions') registerOptions: RegisterOptions,
    @Ctx() { req, redis }: MyContext
  ): Promise<UserResponse> {
    const { email, full_name, otp, password, phone } = registerOptions;

    const redisKey = VERIFY_PHONE_NUMBER_PREFIX + phone;
    const storedOTP = await redis.get(redisKey);

    const isValidOTP = storedOTP?.toString() === otp.toString();

    if (!isValidOTP || !storedOTP) {
      return {
        errors: [{ field: 'otp', message: 'Invalid OTP', code: 400 }],
      };
    }

    const hashedPassword = await argon2.hash(password);

    const user = User.create({
      full_name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone,
      confirmed: true,
    });

    try {
      await user.save();
      await redis.del(redisKey);

      req.session!.userId = user.id;

      return { user };
    } catch (err) {
      const errors = checkDuplicationError(err);
      return {
        errors,
      };
    }
  }

  //LOGIN Mutation
  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: LoginInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const { identifier, password } = options;

    let processedIdentifier = identifier.trim().toLowerCase();

    const user = await User.findOne(
      identifier.includes('@')
        ? { where: { email: processedIdentifier } }
        : { where: { phone: processedIdentifier } }
    );

    if (!user) {
      return {
        errors: [
          {
            field: 'identifier',
            message: 'Incorrect Username or Email',
            code: 401, // Unauthorized Code
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Incorrect Password',
            code: 401,
          },
        ],
      };
    }

    user.last_login = new Date();
    user.save();

    req!.session!.userId = user.id;

    return { user };
  }

  //LOGOUT Mutation
  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
    return new Promise((response) =>
      req.session?.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) response(false);

        response(true);
      })
    );
  }

  //Change Password Mutation
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('identifier') identifier: string,
    @Ctx() { redis }: MyContext
  ): Promise<Boolean> {
    const isEmail = identifier.includes('@');
    const processedIdentifier = identifier.trim().toLowerCase();
    const user = await User.findOne(
      isEmail
        ? { where: { email: processedIdentifier } }
        : { where: { phone: processedIdentifier } }
    );
    if (!user) return true; //for security reasons, we don't tell the user that this email does not exist

    const otp = Math.floor(1000 + Math.random() * 9000);

    const token = isEmail ? await v4() : otp;

    const expirationDate = isEmail ? 60 * 60 * 24 : 60 * 10;
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      expirationDate
    ); //1 day expiration if email, 10 minutes expiration if phone number)

    isEmail
      ? await sendEmail(
          processedIdentifier,
          `<a href='http://localhost:3000/change-password/${token}'>Reset Password</a>`,
          'Reset Password Email'
        )
      : await sendSMS(
          `Your requested a reset password here is your ${otp}`,
          processedIdentifier
        );

    return true;
  }

  @Query(() => Boolean)
  async isValidToken(@Arg('token') token: string, @Ctx() { redis }: MyContext) {
    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);
    if (!userId) return false;
    return true;
  }

  @Mutation(() => ChangePasswordResponse)
  async changePassword(
    @Ctx() { redis }: MyContext,
    @Arg('options') options: ChangePasswordInput
  ): Promise<ChangePasswordResponse> {
    const { token, password, confirmPassword } = options;

    if (password !== confirmPassword) {
      return {
        success: false,
        errors: [
          {
            field: 'confirmPassword',
            message: 'Passwords do not match',
            code: 400,
          },
        ],
      };
    }
    const tokenRedisKey = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(tokenRedisKey);
    if (!userId) {
      return {
        success: false,
        errors: [
          {
            field: 'token',
            message: 'Token not found',
            code: 404,
          },
        ],
      };
    }
    const userIdNum = parseInt(userId);
    const user = await User.findOne({ id: userIdNum });
    if (!user) {
      return {
        success: false,
        errors: [
          {
            field: 'user',
            message: 'User not found',
            code: 404,
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(password);
    await User.update({ id: userIdNum }, { password: hashedPassword });

    await redis.del(tokenRedisKey);

    return {
      success: true,
    };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async addUserTag(
    @Arg('tag', () => UserTagsType) tag: UserTagsType,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const user = await User.findOne({ id: req.session.userId });

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
  ): Promise<Boolean> {
    const { bio, lat, lng } = updateOptions;

    const userId = req.session.userId;
    const user = await User.findOne({ id: userId });
    if (!user) return false;

    if (bio) {
      user.bio = bio;
    }

    //update location
    if (lat && lng) {
      user.lat = lat;
      user.lng = lng;
    }

    await user.save().catch((err) => {
      console.log(`🚀 ~ file: user.ts ~ line 428 ~ UserResolver ~ err`, err);

      return false;
    });

    return true;
  }

  @Query(() => [User], { nullable: true })
  async getNearestLocations(
    @Arg('options') options: FindNearestUsersInput
  ): Promise<User[] | undefined> {
    const { radius, lat: currentLat, lng: currentLong } = options;
    /* 
    TODO: will need optimization later as we're calculating this distance for every user and this is not efficient

       Better way to build this is to hav minimum and maximum latitude and longitude like a bounding box,
       then we can query the database for users within that bounding box,
       and then calculate the distance for only these users
    */

    const sql = `
              select * 
              from 
              (
                SELECT 
                id, email,phone,full_name,lat,lng,
                (
                  6371 *
                  acos(cos(radians(${currentLat})) * 
                  cos(radians(lat)) * 
                  cos(radians(lng) - 
                  radians(${currentLong})) + 
                  sin(radians(${currentLat})) * 
                  sin(radians(lat)))
              ) AS distance 
              from public."user"
              ) as innerTable
              where distance < ${radius}
              ORDER BY distance;`;

    const users = (await getConnection().query(sql)) as User[] | undefined;
    console.log(`🚀 ~ file: user.ts ~ line 463 ~ UserResolver ~ users`, users);

    return users;
  }
}

export default UserResolver;
