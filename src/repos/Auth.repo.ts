import argon2 from 'argon2';
import IORedis from 'ioredis';
import { getAuthClient } from '../provider/auth';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
/* We need to separate the logic outside the resolvers
    1. Register the user
    2. Login the user
    3. Logout the user
    4. Update the user info
    5. Link the user to his provider
*/
import { User } from '../entity/UserEntities/User';
import { VERIFY_PHONE_NUMBER_PREFIX, __prod__ } from './../constants';
import { CREATE_INVALID_ERROR } from './../errors';
import { RegisterOptions } from './../types/input.types';
import { UserResponse } from './../types/response.types';

@Service()
@EntityRepository(User)
export class AuthRepo extends Repository<User> {
  private async isValidOTP(otp: number, phone: string, redis: IORedis.Redis) {
    try {
      const redisKey = VERIFY_PHONE_NUMBER_PREFIX + phone;
      const storedOTP = await redis.get(redisKey);
      return storedOTP?.toString() === otp.toString();
    } catch (e) {
      return false;
    }
  }

  private async registerUsingAuthProvider(
    userInfo: RegisterOptions
  ): Promise<User | null> {
    const { email, full_name, phone, provider, providerId } = userInfo;
    // we have to make this as generic as possible, so we will use the general AuthProvider interface and then we will use the provider type to get the user's info
    const client = getAuthClient(provider, providerId);
    if (!client || !client.isUserVerified()) return null;

    const extUserInfo = await client.getUser();

    if (!extUserInfo) return null;

    const user = User.create({
      full_name,
      email: email.trim().toLowerCase(),
      phone,
      confirmed: true,
      last_login: new Date(),
      provider,
      providerId,
    });
    return user;
  }

  private async registerUsingPassword(
    userInfo: RegisterOptions
  ): Promise<User | null> {
    const { email, full_name, password, phone } = userInfo;
    if (!password) return null;

    const hashedPassword = await argon2.hash(password);

    const user = User.create({
      full_name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone,
      confirmed: true,
      last_login: new Date(),
    });
    return user;
  }

  async register(
    userInfo: RegisterOptions,
    redis: IORedis.Redis
  ): Promise<UserResponse> {
    const { otp, password, phone, provider, providerId } = userInfo;

    if (!this.isValidOTP(otp, phone, redis) && !__prod__) {
      //todo: remove __prod__ flag on production
      return {
        errors: [CREATE_INVALID_ERROR('otp')],
      };
    }
    /* STEPS to be implemented 
        1. validate the provider id and get the user's info (only if provider and provider id are given) 
        2. get the user back from the GoogleAuthProvider
        3. check whether the user is already registered or not (3 cases must be covered)
        4. attach the external user info into the new user and create the user
        5. save the user to the db
        6. return the user
    */
    let user: User | null = null;

    if (provider && providerId) {
      //continue with the registration using the provider
      user = await this.registerUsingAuthProvider(userInfo);
    } else if (password) {
      //continue with the registration using the password
      user = await this.registerUsingPassword(userInfo);
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
}
