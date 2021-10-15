import { MissingPostComments } from './../types/inputTypes';
import { isAuth } from './../middleware/isAuth';
import { CommentResponse, PaginatedComments } from './../types/responseTypes';
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
import { getConnection, In, LessThan, Raw } from 'typeorm';

const CommentBaseResolver = createBaseResolver('Comment', Comment);

@Resolver(Comment)
export class CommentResolver extends CommentBaseResolver {
  @Query(() => PaginatedComments)
  async comments(
    @Ctx() { req }: MyContext,
    @Arg('options') { limit, postId, cursor }: MissingPostComments
  ): Promise<PaginatedComments> {
    //1. Fetch the latest 10 comments for the given post id where parentID equals null

    /* 
    1. Select the parents' ids from comment where postId = given postId and parentId is NULL
    2. JOIN the parents with the comments table on parentId equals id (Given in step 1)
    3. Restructure the data to be in the format of:
    [{  comment:{
        ...commentData,
        replies:[{
            ...commentData aka replyData,
        }]
    }]
    
    OR JUST
    1. Select all the comments where postId = given postId and parentId is NULL 
    2. SELECT all the comments where parentId in the list of parentIds
    */
    const realLimit = Math.min(limit, 50);
    const realLimitPlusOne = realLimit + 1;

    const comments = await Comment.find({
      where: {
        postId,
        parentId: null,
        createdAt: LessThan(cursor ? new Date(cursor) : new Date()),
      },

      order: { createdAt: 'DESC' },
      take: realLimitPlusOne,
    });
    /* 
     todo: can be improved by using a FieldResolver instead of always fetching the replies
     * -> But its not really needed as the whole mutation performs only two sql queries
    */
    const replies = await Comment.find({
      where: {
        parentId: In(comments.map((parent) => parent.id)),
      },
      order: { createdAt: 'DESC' },
      take: 3,
    });

    comments.forEach((comment) => {
      comment.replies = replies.filter(
        (reply) => reply.parentId === comment.id
      );
    });

    return {
      comments: comments.slice(0, realLimit),
      hasMore: comments.length === realLimitPlusOne,
    };
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
    comment.isEdited = true;
    await comment.save();
    return {
      comment,
    };
  }

  //todo: in case of deleting a parent comment, delete all the comments that are connected to it
}
