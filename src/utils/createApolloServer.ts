import {
  createUserLoader,
  createPetLoader,
  createAddressLoader,
  createPetImagesLoader,
  createPostImageLoader,
} from './dataLoaders';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { Redis } from 'ioredis';
import { MyContext } from '../types';
import { createSchema } from './createSchema';

export const createApolloServer = async (redis: Redis) => {
  return new ApolloServer({
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      dataLoaders: {
        petLoader: createPetLoader(),
        userLoader: createUserLoader(),
        addressLoader: createAddressLoader(),
        petImagesLoader: createPetImagesLoader(),
        postImagesLoader: createPostImageLoader(),
      },
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
