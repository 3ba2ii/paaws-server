import { User } from './../entity/UserEntities/User';
import { MyContext } from '../types';
import { MiddlewareFn } from 'type-graphql';

export const isUserFound: MiddlewareFn<MyContext> = async (
  { context: { req } },
  next
) => {
  if (!req.session.userId) {
    throw new Error('Not Authenticated');
  }
  const user = await User.findOne(req.session.userId);
  if (!user) {
    throw new Error('User not found');
  }

  req.session.user = user;

  return next();
};
