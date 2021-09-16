import { MyContext } from 'src/types';
import { MiddlewareFn } from 'type-graphql';

export const isValidPhoneNumber: MiddlewareFn<MyContext> = (
  { context: { req } },
  next
) => {
  const { phoneNumber } = req.body;

  return next();
};
