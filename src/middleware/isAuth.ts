import { MyContext } from '../types';
import { MiddlewareFn } from 'type-graphql';
import { COOKIE_NAME } from '../constants';

export const isAuth: MiddlewareFn<MyContext> = (
  { context: { req, res } },
  next
) => {
  if (!req.session.userId) {
    res.clearCookie(COOKIE_NAME);
    throw new Error('Not Authenticated');
  }

  return next();
};
