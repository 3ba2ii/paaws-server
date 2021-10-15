import { isAuth } from './../middleware/isAuth';
import { CommentResponse } from './../types/responseTypes';
import { MyContext } from './../types';
import { Comment } from './../entity/InteractionsEntities/Comment';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
  Int,
} from 'type-graphql';
import { createBaseResolver } from '../utils/createBaseResolver';

const CommentBaseResolver = createBaseResolver('Comment', Comment);

@Resolver(Comment)
export class CommentResolver extends CommentBaseResolver {
  @Query(() => [Comment])
  comments(@Ctx() { req }: MyContext) {
    return Comment.find();
  }
  @Mutation(() => CommentResponse)
  @UseMiddleware(isAuth)
  async editComment(
    @Ctx() { req }: MyContext,
    @Arg('commentId', () => Int) commentId: number,
    @Arg('text') text: string
  ): Promise<CommentResponse> {
    if (
      text == null ||
      (typeof text === 'string' && text.trim().length === 0)
    ) {
      return {
        errors: [
          {
            field: 'text',
            message: 'Not a valid text',
            code: 400,
          },
        ],
      };
    }
    const comment = await Comment.findOne(commentId);
    if (!comment) {
      return {
        errors: [
          {
            field: 'commentId',
            message: 'Comment not found',
            code: 404,
          },
        ],
      };
    }
    if (comment.userId !== req.session.userId) {
      return {
        errors: [
          {
            field: 'commentId',
            message: 'you are not the owner of this comment',
            code: 403,
          },
        ],
      };
    }
    comment.text = text;
    await comment.save();
    return {
      comment,
    };
  }

  //todo: in case of deleting a parent comment, delete all the comments that are connected to it
}
