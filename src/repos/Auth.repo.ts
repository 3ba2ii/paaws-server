import argon2 from 'argon2';
import IORedis from 'ioredis';
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
import { ProviderTypes } from './../types/enums.types';
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

  private createUserWithAuthProvider(
    provider: ProviderTypes,
    providerId: string,
    registerOptions: RegisterOptions
  ) {
    /* check for provider and provider id */
    /* we will use the providers repo to validate and get the user's info */
    // 1. we validate the provider id and return an error if it's not valid
  }

  async register(
    userInfo: RegisterOptions,
    redis: IORedis.Redis
  ): Promise<UserResponse> {
    const { email, full_name, otp, password, phone, provider, providerId } =
      userInfo;

    if (!this.isValidOTP(otp, phone, redis) && __prod__) {
      //todo: remove __prod__ flag on production
      return {
        errors: [CREATE_INVALID_ERROR('otp')],
      };
    }
    const hashedPassword = await argon2.hash(password);

    /* If we have provider id and provider, so we get the user's info from its provider and just add the password */

    const user = User.create({
      full_name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone,
      confirmed: true,
      last_login: new Date(),
    });

    /* check for provider and provider id */
    if (provider && providerId) {
      /* validate the provider id
           must implement a switch case for each provider        
       */
    }
    return {
      errors: [
        { code: 500, message: 'Internal Server Error', field: 'internal' },
      ],
    };
  }
}
