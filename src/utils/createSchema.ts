import { GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import PetResolver from '../resolvers/pet';
import UserResolver from '../resolvers/user';

let schema: GraphQLSchema;

export const createSchema = async () => {
  if (!schema) {
    schema = await buildSchema({
      resolvers: [UserResolver, PetResolver],
      validate: true,
    });
  }
  return schema;
};
