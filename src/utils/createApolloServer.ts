import { createUserLoader } from './createUserLoader';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { Redis } from 'ioredis';
import { MyContext } from '../types';
import { createPetLoader } from './createPetLoader';
import { createSchema } from './createSchema';

export const createApolloServer = async (redis: Redis) => {
  return new ApolloServer({
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      petLoader: createPetLoader(),
      userLoader: createUserLoader(),
    }),
    schema: await createSchema(),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
        settings: {
          'request.credentials': 'include',
        },
      }),
    ],
  });
};
