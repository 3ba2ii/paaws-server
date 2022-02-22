import { Request } from 'express';
import { ProviderTypes } from './../../types/enums.types';
import argon2 from 'argon2';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { v4 } from 'uuid';
import {
  COOKIE_NAME,
  FORGET_PASSWORD_PREFIX,
  PHONE_NUMBER_REG_EXP,
  VERIFY_PHONE_NUMBER_PREFIX,
} from '../../constants';
import { User } from '../../entity/UserEntities/User';
import {
  CREATE_ALREADY_EXISTS_ERROR,
  CREATE_INVALID_ERROR,
  CREATE_NOT_FOUND_ERROR,
  INTERNAL_SERVER_ERROR,
} from '../../errors';
import { MyContext } from '../../types';
import {
  ChangePasswordInput,
  LoginInput,
  BaseRegisterInput,
} from '../../types/input.types';
import {
  ChangePasswordResponse,
  FieldError,
  RegularResponse,
  UserResponse,
} from '../../types/response.types';
import { checkDuplicationError } from '../../utils/checkDuplicationError';
import { sendEmail } from '../../utils/sendEmail';
import { sendSMS } from '../../utils/sendSMS';
import { AuthRepo } from './../../repos/Auth.repo';

@Resolver(User)
export class LocalAuthResolver {
  constructor(private readonly authRepo: AuthRepo) {}

  private async saveUserToDB(user: User, req: Request) {
    try {
      await user.save();
      req.session.userId = user.id;

      return { user };
    } catch (err) {
      return {
        errors: checkDuplicationError(err),
      };
    }
  }
  //LOGIN Mutation
  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: LoginInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    return this.authRepo.loginWithIdentifierAndPassword(options, req);
  }

  //LOGOUT Mutation
  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((response) =>
      req.session?.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) response(false);

        response(true);
      })
    );
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
    return this.authRepo.sendOTP(phone, email, redis);
  }

  @Mutation(() => UserResponse)
  async registerWithAuthProvider(
    @Arg('provider', () => ProviderTypes)
    provider: ProviderTypes,
    @Arg('providerId') providerId: string,
    @Ctx() { req }: MyContext
  ) {
    const { errors, user } = await this.authRepo.register(
      null,
      provider,
      providerId
    );

    if (errors && errors.length > 0) return { errors };

    if (!user) return { errors: [INTERNAL_SERVER_ERROR] };

    return this.saveUserToDB(user, req);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('registerOptions') registerOptions: BaseRegisterInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const { errors, user } = await this.authRepo.register(registerOptions);

    if (errors && errors.length > 0) return { errors };

    if (!user) return { errors: [INTERNAL_SERVER_ERROR] };

    return this.saveUserToDB(user, req);
  }

  //Change Password Mutation
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('identifier') identifier: string,
    @Ctx() { redis }: MyContext
  ): Promise<boolean> {
    const isEmail = identifier.includes('@');
    const processedIdentifier = identifier.trim().toLowerCase();
    const user = await User.findOne(
      isEmail
        ? { where: { email: processedIdentifier } }
        : { where: { phone: processedIdentifier } }
    );
    if (!user) return true; //for security reasons, we don't tell the user that this email does not exist

    const otp = Math.floor(1000 + Math.random() * 9000);

    const token = isEmail ? v4() : otp;

    const expirationDate = isEmail ? 60 * 60 * 24 : 60 * 10;
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      expirationDate
    ); //1 day expiration if email, 10 minutes expiration if phone number)

    try {
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
    } catch (err) {
      console.error(`🚀 ~ file: user.ts ~ line 346 ~ UserResolver ~ err`, err);
      return false;
    }
  }

  @Query(() => Boolean)
  async isValidToken(@Arg('token') token: string, @Ctx() { redis }: MyContext) {
    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);
    if (!userId) return false;
    return true;
  }

  @Mutation(() => ChangePasswordResponse)
  async changePassword(
    @Ctx() { req, redis }: MyContext,
    @Arg('options') options: ChangePasswordInput
  ): Promise<ChangePasswordResponse> {
    const { token, password, confirmPassword } = options;

    if (password !== confirmPassword) {
      return {
        success: false,
        errors: [
          CREATE_INVALID_ERROR('confirmPassword', 'Passwords do not match'),
        ],
      };
    }
    const tokenRedisKey = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(tokenRedisKey);
    if (!userId) {
      return {
        success: false,
        errors: [CREATE_NOT_FOUND_ERROR('token')],
      };
    }
    const userIdNum = parseInt(userId);
    const user = await User.findOne({ id: userIdNum });
    if (!user) {
      return {
        success: false,
        errors: [CREATE_NOT_FOUND_ERROR('user')],
      };
    }
    const hashedPassword = await argon2.hash(password);
    await User.update({ id: userIdNum }, { password: hashedPassword });

    await redis.del(tokenRedisKey);

    //todo: send email to user to notify that password has been changed
    // log the user in
    user.last_login = new Date();
    user.save();

    req.session.userId = user.id;

    return {
      success: true,
    };
  }
}
