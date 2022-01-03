import { DeleteResponse } from '../types/responseTypes';
import {
  Arg,
  ClassType,
  Ctx,
  Int,
  Mutation,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { getRepository } from 'typeorm';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

//
export function createBaseResolver<T extends ClassType>(
  suffix: string,
  entity: T
) {
  @Resolver({ isAbstract: true })
  abstract class BaseResolver {
    @Mutation(() => DeleteResponse, { name: `delete${suffix}` })
    @UseMiddleware(isAuth)
    async delete(
      @Arg('id', () => Int) id: number,
      @Ctx() { req }: MyContext
    ): Promise<DeleteResponse> {
      const userId = req.session.userId;
      const repo = getRepository(entity);
      const instance = await repo.findOne(id);
      if (!instance)
        return {
          errors: [{ field: 'id', code: 404, message: 'Not found' }],
          deleted: false,
        };
      if (instance.userId !== userId) {
        return {
          errors: [{ field: 'user', code: 403, message: 'Not Authorized' }],
          deleted: false,
        };
      }
      await repo.delete(id);

      return { deleted: true };
    }
  }

  return BaseResolver;
}
