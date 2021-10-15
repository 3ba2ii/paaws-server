import { GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import { Container } from 'typeorm-typedi-extensions';
import AddressResolver from '../resolvers/address';
import AdoptionPostResolver from '../resolvers/adoption-post';
import { CommentResolver } from '../resolvers/comment';
import MissingPostResolver from '../resolvers/missing-post';
import PetResolver from '../resolvers/pet';
import PhotoResolver from '../resolvers/photo';
import UserResolver from '../resolvers/user';

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
        MissingPostResolver,
        CommentResolver,
      ],
      validate: true,
      container: Container,
    });
  }
  return schema;
};
