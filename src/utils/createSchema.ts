import { GraphQLSchema } from 'graphql';
import PhotoResolver from '../resolvers/photo';
import { buildSchema } from 'type-graphql';
import PetResolver from '../resolvers/pet';
import UserResolver from '../resolvers/user';
import AdoptionPostResolver from '../resolvers/post';
import AddressResolver from '../resolvers/address';

let schema: GraphQLSchema;

export const createSchema = async () => {
  if (!schema) {
    schema = await buildSchema({
      resolvers: [
        UserResolver,
        PetResolver,
        PhotoResolver,
        AdoptionPostResolver,
        AddressResolver,
      ],
      validate: true,
    });
  }
  return schema;
};
