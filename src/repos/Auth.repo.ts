import argon2 from 'argon2';
import { Request } from 'express';
import IORedis from 'ioredis';
import { sendEmail } from '../utils/sendEmail';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/UserEntities/User';
import { getAuthClient } from '../provider/auth';
import { sendSMS } from '../utils/sendSMS';
import {
  PHONE_NUMBER_REG_EXP,
  VERIFY_EMAIL_PREFIX,
  VERIFY_PHONE_NUMBER_PREFIX,
} from './../constants';
import {
  CREATE_ALREADY_EXISTS_ERROR,
  CREATE_INVALID_ERROR,
  CREATE_NOT_AUTHORIZED_ERROR,
  CREATE_NOT_FOUND_ERROR,
  INTERNAL_SERVER_ERROR,
} from './../errors';
import { ProviderTypes } from './../types/enums.types';
import { BaseRegisterInput, LoginInput } from './../types/input.types';
import { RegularResponse, UserResponse } from '../types/response.types';

/* We need to separate the logic outside the resolvers
    1. Register the user
    2. Login the user
    3. Logout the user
    4. Update the user info
    5. Link the user to his provider
*/
@Service()
@EntityRepository(User)
export class AuthRepo extends Repository<User> {
  private async isValidOTP(
    otp: string,
    redisKey: string,
    redis: IORedis.Redis
  ) {
    try {
      const storedOTP = await redis.get(redisKey);

      return storedOTP?.toString() === otp.toString();
    } catch (e) {
      return false;
    }
  }

  private async authenticateUsingProvider(
    provider: ProviderTypes,
    idToken: string
  ): Promise<User | null> {
    // we have to make this as generic as possible, so we will use the general AuthProvider interface and then we will use the provider type to get the user's info
    const client = getAuthClient(provider, idToken);
    if (!client || !client.isUserVerified()) return null;

    /* verify the auth token */
    await client.verifyAuthToken();

    /* Get user's info from the provider */
    const extUserInfo = await client.getUser();

    if (!extUserInfo) return null;

    /* Check if the user is already registered using his mail*/
    const foundUser = await this.findUserByEmail(extUserInfo.email);

    if (foundUser) {
      if (!foundUser.providerId && foundUser.provider === ProviderTypes.LOCAL) {
        //provider is not set before, so we have set it
        foundUser.provider = extUserInfo.provider;
        foundUser.providerId = extUserInfo.providerId;
      }

      //log the user in
      foundUser.last_login = new Date();

      return foundUser;
    }

    return User.create({
      full_name: extUserInfo.full_name,
      email: extUserInfo.email.trim().toLowerCase(),
      provider: extUserInfo.provider,
      providerId: extUserInfo.providerId,
      last_login: new Date(),
    });
  }

  private async registerUsingPassword(
    userInfo: BaseRegisterInput
  ): Promise<UserResponse> {
    const { email, full_name, password } = userInfo;

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser)
      return {
        errors: [
          CREATE_ALREADY_EXISTS_ERROR(
            'email',
            'This email is already associated with another account.'
          ),
        ],
      };

    const hashedPassword = await argon2.hash(password);

    const user = User.create({
      full_name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      last_login: new Date(),
      provider: ProviderTypes.LOCAL,
    });

    //send email to user
    return { user };
  }
  async findUserByProviderIdOrEmail(
    providerId: string,
    email: string
  ): Promise<User | undefined> {
    return User.findOne({
      where: [{ providerId }, { email }],
    });
  }
  async findUserByEmail(email: string): Promise<User | undefined> {
    return User.findOne({
      where: { email },
    });
  }

  async sendOTP(
    phone: string,
    email: string,
    redis: IORedis.Redis
  ): Promise<RegularResponse> {
    /* create a better otp */

    try {
      const otp = Math.floor(1000 + Math.random() * 9000);

      const phoneNumberRegExp = new RegExp(PHONE_NUMBER_REG_EXP);

      if (!phoneNumberRegExp.test(phone)) {
        return {
          success: false,
          errors: [CREATE_INVALID_ERROR('phone')],
        };
      }

      //find a user associated with this phone number or email
      const user = await User.findOne({ where: [{ email }, { phone }] });
      if (!user) {
        //no user was found, so we send an error to the user
        return { success: false, errors: [CREATE_NOT_FOUND_ERROR('user')] };
      }

      /* then we found a user*/

      /* we have to check if the user already has a verified phone number */
      if ((user.phone && user.phoneVerified) || user.phone === phone) {
        /* then the user already has a verified phone number */
        return {
          success: false,
          errors: [
            CREATE_ALREADY_EXISTS_ERROR(
              'phone',
              'This phone is already used by another user'
            ),
          ],
        };
      }

      /* 1. Store the OTP with the user's phone in redis */
      const redisKey = `${VERIFY_PHONE_NUMBER_PREFIX}:${phone}`;
      await redis.set(redisKey, otp, 'ex', 60 * 5);

      /* 2. Send SMS to this user containing the OTP*/
      const { sent } = await sendSMS(`Your OTP for Paaws is ${otp}`, phone);

      return sent
        ? { success: true }
        : {
            success: false,
            errors: [
              INTERNAL_SERVER_ERROR,
              {
                code: 500,
                field: 'phone',
                message:
                  'An error occurred sending SMS to this phone number, Please try again later.',
              },
            ],
          };
    } catch (err) {
      return { success: false, errors: [INTERNAL_SERVER_ERROR, err] };
    }
  }

  async verifyUserPhoneNumber(
    user: User,
    phone: string,
    otp: string,
    redis: IORedis.Redis
  ): Promise<RegularResponse> {
    try {
      const redisKey = `${VERIFY_PHONE_NUMBER_PREFIX}:${phone}`;

      const isValid = await this.isValidOTP(otp, redisKey, redis);

      if (!isValid) {
        return {
          success: false,
          errors: [CREATE_INVALID_ERROR('otp', 'Incorrect OTP')],
        };
      }

      /* then the otp is valid */
      /* we have to update the user's phone number */
      user.phone = phone;
      user.phoneVerified = true;
      await user.save();

      /* then we have to delete the otp from redis */
      await redis.del(redisKey);

      return { success: true };
    } catch (err) {
      return { success: false, errors: [INTERNAL_SERVER_ERROR, err] };
    }
  }

  async sendEmailVerification(email: string, redis: IORedis.Redis) {
    const code = Math.floor(Math.random() * 1000000);
    const redisKey = `${VERIFY_EMAIL_PREFIX}:${email}`;

    //1. send email to the user with the verification code
    const sent = await sendEmail(
      email,
      `your verification code is: ${code}`,
      'verify email'
    );
    if (!sent) return false;

    //2. save the code in redis
    await redis.set(redisKey, code, 'ex', 60 * 60 * 5);

    return true;
  }

  async register(
    userInfo?: BaseRegisterInput | null,
    provider?: ProviderTypes,
    idToken?: string
  ): Promise<UserResponse> {
    /* STEPS to be implemented 
        1. validate the provider id and get the user's info (only if provider and provider id are given) 
        2. get the user back from the GoogleAuthProvider
        3. check whether the user is already registered or not (3 cases must be covered)
        4. attach the external user info into the new user and create the user
        5. save the user to the db
        6. return the user
    */
    let user: User | null = null;
    if (provider && idToken) {
      user = await this.authenticateUsingProvider(provider, idToken);
    } else if (userInfo && userInfo.password && userInfo.confirmPassword) {
      const { user: createdUser, errors } = await this.registerUsingPassword(
        userInfo
      );
      if ((errors && errors.length) || !createdUser) return { errors };
      user = createdUser;
    }

    if (!user) {
      return {
        errors: [
          {
            code: 500,
            message:
              'We could not create the user right now, please try again later',
            field: 'server',
          },
        ],
      };
    }

    return { user };
  }
  async loginWithIdentifierAndPassword(
    options: LoginInput,
    req: Request
  ): Promise<UserResponse> {
    const { identifier, password } = options;
    const processedIdentifier = identifier.trim().toLowerCase();
    const user = await User.findOne(
      identifier.includes('@')
        ? { where: { email: processedIdentifier } }
        : { where: { phone: processedIdentifier } }
    );
    /* user not found or user is found but there is no password (registered with auth provider) */
    if (!user) {
      return {
        errors: [
          CREATE_NOT_AUTHORIZED_ERROR(
            'identifier',
            'Incorrect Phone Number or Email'
          ),
        ],
      };
    }

    if (user && !user.password && user.providerId) {
      return {
        errors: [
          CREATE_NOT_AUTHORIZED_ERROR(
            'identifier',
            'User is registered with an auth provider, Please try to login with that provider'
          ),
        ],
      };
    }

    /* validate password */
    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [CREATE_NOT_AUTHORIZED_ERROR('password', 'Incorrect password')],
      };
    }

    user.last_login = new Date();
    await user.save();

    req.session.userId = user.id;

    return { user };
  }

  async loginWithProvider(
    provider: ProviderTypes,
    idToken: string
  ): Promise<UserResponse> {
    /* run the register mutation as it includes the both options of login and register */
    const user = await this.authenticateUsingProvider(provider, idToken);

    return user ? { user } : { errors: [INTERNAL_SERVER_ERROR] };
  }
}
