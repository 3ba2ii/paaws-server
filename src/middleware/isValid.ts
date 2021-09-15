import { MyContext } from 'src/types';
import { MiddlewareFn } from 'type-graphql';

export const isValidPhoneNumber: MiddlewareFn<MyContext> = (
  { context: { req } },
  next
) => {
  console.log(`🚀 ~ file: isValid.ts ~ line 8 ~ req`, req);
  const { phoneNumber } = req.body;

  return next();
};
