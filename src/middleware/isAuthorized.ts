import { AuthorizationInputType } from './../types/authorization.types';
import { MyContext } from '../types';
import { MiddlewareFn } from 'type-graphql';
import { AUTH_TOKEN_PREFIX, COOKIE_NAME } from '../constants';

export const isAuthorized: MiddlewareFn<MyContext> = async (
  { context: { req, res, redis } },
  next
) => {
  try {
    if (!req.session.userId) {
      res.clearCookie(COOKIE_NAME);
      throw new Error('Not Authenticated');
    }
    const variables = req.body?.variables;
    if (!variables) {
      throw new Error('Not Authorized');
    }
    const authToken = variables.authToken;
    const authAction = variables.authAction;
    if (!authToken || !authAction) {
      throw new Error('Not Authorized');
    }

    const storedAuthAction = await redis.get(
      `${AUTH_TOKEN_PREFIX}:${authToken}`
    );

    if (!storedAuthAction) {
      throw new Error('Not Authorized');
    }

    const { action, userId } = JSON.parse(
      storedAuthAction
    ) as AuthorizationInputType;

    //check whether the same user is trying to perform the same action
    if (action !== authAction || userId !== req.session.userId) {
      throw new Error('Not Authorized');
    }

    return next();
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};
