import * as Sentry from '@sentry/node';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPlugin,
  GraphQLRequestContext,
  WithRequired,
} from 'apollo-server-plugin-base';
import { Redis } from 'ioredis';
import { MyContext } from '../types';
import { createSchema } from './createSchema';
import {
  createAddressLoader,
  createCommentVoteStatusLoader,
  createPetImagesLoader,
  createPetLoader,
  createPetSkillsLoader,
  createPhotoLoader,
  createPostImageLoader,
  createUserLoader,
  createVoteStatusLoader,
} from './dataLoaders';

Sentry.init({
  environment: process.env.NODE_ENV || 'development',
  // see why we use APP_NAME here: https://github.com/getsentry/sentry-cli/issues/482
  release: `paaws-server-${process.env.NODE_ENV || 'development'}`,
  dsn: process.env.SENTRY_DSN,
});

const apolloLifecyclePlugins: ApolloServerPlugin = {
  // For plugin definition see the docs: https://www.apollographql.com/docs/apollo-server/integrations/plugins/
  async requestDidStart(_ctx) {
    return {
      async didEncounterErrors(
        rc: WithRequired<
          GraphQLRequestContext<MyContext>,
          'metrics' | 'source' | 'errors' | 'logger'
        >
      ): Promise<void> {
        Sentry.withScope((scope) => {
          scope.addEventProcessor((event) =>
            Sentry.Handlers.parseRequest(event, rc.context.req)
          );

          // public user email
          const userEmail = rc.context.req?.session?.userId;
          if (userEmail) {
            scope.setUser({
              // id?: string;
              ip_address: rc.context.req?.ip,
              email: userEmail + '',
            });
          }

          scope.setTags({
            graphql: rc.operation?.operation || 'parse_err',
            graphqlName: rc.operationName || rc.request.operationName,
            environment: process.env.NODE_ENV,
          });

          rc.errors.forEach((error) => {
            if (error.path || error.name !== 'GraphQLError') {
              scope.setExtras({
                path: error.path,
              });
              Sentry.captureException(error);
            } else {
              scope.setExtras({});
              Sentry.captureMessage(`GraphQLWrongQuery: ${error.message}`);
            }
          });
        });
      },
    };
  },
};

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
        petSkillsLoader: createPetSkillsLoader(),
        postImagesLoader: createPostImageLoader(),
        photoLoader: createPhotoLoader(),
        votingLoader: createVoteStatusLoader(),
        commentVoteStatusLoader: createCommentVoteStatusLoader(),
      },
    }),
    schema: await createSchema(),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
        settings: {
          'request.credentials': 'include',
        },
      }),
      apolloLifecyclePlugins,
    ],
  });
};
