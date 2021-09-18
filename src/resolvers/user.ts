import argon2 from 'argon2';
import { createWriteStream } from 'fs';
import { GraphQLUpload } from 'graphql-upload';
import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { v4 } from 'uuid';
import {
  ChangePasswordInput,
  ChangePasswordResponse,
  LoginInput,
  RegisterOptions,
  RegularResponse,
  UserResponse,
} from '../types/responseTypes';
import { UserTagsType } from '../types/types';
import { Upload } from '../types/Upload';
import { checkDuplicationError } from '../utils/checkDuplicationError';
import { sendEmail } from '../utils/sendEmail';
import {
  COOKIE_NAME,
  FORGET_PASSWORD_PREFIX,
  VERIFY_PHONE_NUMBER_PREFIX,
} from './../constants';
import { Pet } from './../entity/Pet';
import { Photo } from './../entity/Photo';
import { User } from './../entity/User';
import { UserAvatar } from './../entity/UserAvatar';
import { UserFavorites } from './../entity/UserFavorites';
import { UserTag } from './../entity/UserTags';
import { isAuth } from './../middleware/isAuth';
import { MyContext } from './../types';
import { sendSMS } from './../utils/sendSMS';

@Resolver(User)
class UserResolver {
  @Query(() => User, {
    nullable: true,
  })
  @UseMiddleware(isAuth)
  async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    return User.findOne(
      { id: req.session.userId },
      {
        relations: ['pets', 'tags'],
      }
    );
  }
  @Query(() => [User])
  async users(): Promise<User[]> {
    return await User.find({
      relations: ['pets', 'tags', 'favorites', 'favorites.pet', 'pets.breeds'],
    });
  }

  @Query(() => User, {
    nullable: true,
  })
  @UseMiddleware(isAuth)
  async user(@Arg('id', () => Int) id: number): Promise<User | undefined> {
    return User.findOne(
      { id },
      {
        relations: ['pets', 'tags'],
      }
    );
  }

  @Mutation(() => RegularResponse)
  async sendOTP(
    @Arg('phone') phone: string,
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

    const user = await User.findOne({ where: { phone } });

    if (user) {
      return {
        success: false,
        errors: [
          {
            message: 'Phone number is already registered',
            field: 'phone',
            code: 409, //Conflict Code
          },
        ],
      };
    }

    await redis.set(VERIFY_PHONE_NUMBER_PREFIX + phone, otp, 'ex', 60 * 10);
    await sendSMS(`Your OTP is ${otp}`, phone);

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
  async uploadAvatar(
    @Arg('image', () => GraphQLUpload) { createReadStream, filename }: Upload,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const userId = req.session.userId;
    if (!userId) return false;

    const user = await User.findOne({ id: userId });
    if (!user) return false;

    const path = __dirname + `/../../images/${filename}`;

    const image = Photo.create({
      creator: user,
      filename,
      path,
      isOnDisk: true,
    });
    const userAvatar = UserAvatar.create({ user, image });

    getConnection().transaction(async (_transactionalEntityManager) => {
      await new Promise(async (resolve, reject) =>
        createReadStream()
          .pipe(createWriteStream(path))
          .on('finish', () => resolve(true))
          .on('error', () => reject(false))
      );
      await userAvatar.save();
    });

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async likePet(
    @Arg('petId', () => Int) petId: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const pet = await Pet.findOne({ id: petId });
    if (!pet) return false;

    const user = await User.findOne({ id: req.session.userId });

    const userFavorite = UserFavorites.create({ user, pet });

    pet.numberOfLikes += 1;

    try {
      const conn = getConnection();
      await conn.transaction(async (_transactionalEntityManager) => {
        await conn.manager.insert(UserFavorites, userFavorite);
        await pet.save();
      });

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
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
}

export default UserResolver;
