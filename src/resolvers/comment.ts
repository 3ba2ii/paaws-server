import { MyContext } from './../types';
import { Comment } from './../entity/InteractionsEntities/Comment';
import { Ctx, Query, Resolver } from 'type-graphql';
import { createBaseResolver } from '../utils/createBaseResolver';

const CommentBaseResolver = createBaseResolver('Comment', Comment);

@Resolver(Comment)
export class CommentResolver extends CommentBaseResolver {
  @Query(() => [Comment])
  comments(@Ctx() { req }: MyContext) {
    return Comment.find();
  }
}
