import { AuthRepo } from './../../repos/Auth.repo';
import { getAuthClient } from '../../provider/auth';
import { Arg, Ctx, Field, Mutation, ObjectType, Resolver } from 'type-graphql';
import { User } from '../../entity/UserEntities/User';
import { CREATE_INVALID_ERROR } from '../../errors';
import { MyContext } from '../../types';
import { ErrorResponse } from '../../types/response.types';
import { ProviderTypes } from './../../types/enums.types';

/* We need 2 mutations:
  1. a mutation to verify the id token and tells if the user is already registered or not
  2. a mutation to register the user along with the id token and the provider (Already there but needs modifications)
*/

@ObjectType()
class FindUserByTokenIdResponse extends ErrorResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Boolean, { defaultValue: false })
  found: boolean = false;
}

@Resolver(User)
export class ExternalProviderAuthResolver {
  /* we need to implement two basic mutations
     1. a mutation to find the user by provider id or email and return true or false

  */
  constructor(private readonly authRepo: AuthRepo) {}

  @Mutation(() => FindUserByTokenIdResponse)
  async isUserRegistered(
    @Ctx() { req }: MyContext,
    @Arg('idToken') idToken: string,
    @Arg('provider') provider: ProviderTypes
  ): Promise<FindUserByTokenIdResponse> {
    try {
      //1.verify idToken from google API
      const AuthClient = getAuthClient(provider, idToken);

      if (!AuthClient)
        return {
          found: false,
          errors: [CREATE_INVALID_ERROR('provider', 'Invalid provider')],
        };

      const extUserInfo = await AuthClient.getUser();

      if (!extUserInfo)
        return { found: false, errors: [CREATE_INVALID_ERROR('idToken')] };

      //check if the user already exists
      const user = await this.authRepo.findUserByProviderIdOrEmail(
        extUserInfo.providerId,
        extUserInfo.email
      );

      /* We have three cases here 
      1. user is registered but google auth is not linked to the user -> log the user in and update his google auth
      2. user is registered and google auth is linked to the user -> log the user in
      3. user is not registered -> just send a found flag back to continue the registration process
    */
      if (!user) {
        //user not found - > complete the registration process
        return { found: false };
      } else {
        //log the user in and update his info
        req.session.userId = user.id;
        user.last_login = new Date();

        //update user info
        if (!user.provider && !user.providerId) {
          /* Link the provider to this account */
          user.provider = AuthClient.provider;
          user.providerId = extUserInfo.providerId;
        }

        await user.save();
        return { user, found: true };
      }
    } catch (err) {
      return {
        found: false,
        errors: [{ code: 400, field: 'idToken', message: err.message }, err],
      };
    }
  }
}
