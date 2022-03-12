import { graphql } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
import Redis, { Redis as RedisType } from 'ioredis';
import { createApolloServer } from '../utils/createApolloServer';
import { createSchema } from '../utils/createSchema';

interface Options {
  source: string;
  variableValues?: Maybe<{
    [key: string]: any;
  }>;
}
let redis: RedisType;
const createRedisConnection = () => {
  if (!redis) redis = new Redis(process.env.REDIS_URL);
  return redis;
};
export const graphqlCall = async ({ source, variableValues }: Options) => {
  return graphql({
    schema: await createSchema(),
    source,
    variableValues,
    contextValue: await createApolloServer(createRedisConnection()),
  });
};
