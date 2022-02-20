import { CREATE_INVALID_ERROR } from './../../errors';
import { Arg, Ctx, Field, Mutation, ObjectType, Resolver } from 'type-graphql';
import { User } from '../../entity/UserEntities/User';
import { MyContext } from '../../types';
import { GoogleAuthProvider } from './../../provider/auth/google-auth.provider';
import { ErrorResponse } from './../../types/response.types';

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
export class GoogleAuthResolver {
  private async findUserByProviderIdOrEmail(
    providerId: string
  ): Promise<User | undefined> {
    return User.findOne({ where: { provider_id: providerId } });
  }

  @Mutation(() => FindUserByTokenIdResponse)
  async isUserRegistered(
    @Ctx() { req }: MyContext,
    @Arg('idToken') idToken: string
  ): Promise<FindUserByTokenIdResponse> {
    try {
      //1.verify idToken from google API
      const AuthClient = new GoogleAuthProvider(idToken);
      const extUserInfo = await AuthClient.getUser();

      if (!extUserInfo)
        return { found: false, errors: [CREATE_INVALID_ERROR('idToken')] };

      const user = await this.findUserByProviderIdOrEmail(
        extUserInfo.providerId
      );

      /* We have three cases here 
      1. user is registered but google auth is not linked to the user
      2. user is registered and google auth is linked to the user
      3. user is not registered and google is not linked to the user
    */
      //check if the user exist
      if (!user) {
        // if not, send a request back to the server to continue user register process
        return { found: false };
      } else {
        //3. log the user in
        req.session.userId = user.id;

        if (!user.provider) {
          user.provider = AuthClient.provider;
          user.last_login = new Date();
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
