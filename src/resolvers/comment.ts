import { INTERNAL_SERVER_ERROR, CREATE_INVALID_ERROR } from './../errors';
import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { In, LessThan } from 'typeorm';
import { createBaseResolver } from '../utils/createBaseResolver';
import { Comment } from './../entity/InteractionsEntities/Comment';
import { CommentUpdoot } from './../entity/InteractionsEntities/CommentUpdoots';
import { User } from './../entity/UserEntities/User';
import { isAuth } from './../middleware/isAuth';
import { UpdootRepo } from './../repos/UpdootRepo.repo';
import { MyContext } from './../types';
import {
  MissingPostComments,
  ParentCommentReplies,
} from './../types/inputTypes';
import { CommentResponse, PaginatedComments } from './../types/responseTypes';

const CommentBaseResolver = createBaseResolver('Comment', Comment);
@Resolver(Comment)
export class CommentResolver extends CommentBaseResolver {
  constructor(private readonly updootRepo: UpdootRepo) {
    super();
  }

  private async getReplies(
    parentId: number | number[],
    cursor: Date | null,
    limit: number = 3
  ): Promise<PaginatedComments> {
    const realLimit = Math.min(limit, 50);
    const realLimitPlusOne = realLimit + 1;
    const replies = await Comment.find({
      where: {
        parentId: typeof parentId === 'number' ? parentId : In(parentId),
        createdAt: LessThan(cursor ? new Date(cursor) : new Date()),
      },
      order: { createdAt: 'DESC' },
      take: realLimitPlusOne,
    });

    return {
      comments: replies.slice(0, realLimit),
      hasMore: replies.length === realLimitPlusOne,
    };
  }
  @Query(() => PaginatedComments)
  async comments(
    @Arg('options') { limit, postId, cursor }: MissingPostComments
  ): Promise<PaginatedComments> {
    //1. Fetch the latest 10 comments for the given post id where parentID equals null

    /*     
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
    const { comments: replies, errors } = await this.getReplies(
      comments.map((c) => c.id),
      null,
      3
    );

    if (errors && errors?.length > 0)
      return {
        errors,
      };
    if (replies)
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

  @Query(() => PaginatedComments)
  async getCommentReplies(
    @Arg('options') { limit, parentId, cursor }: ParentCommentReplies
  ): Promise<PaginatedComments> {
    const dateCursor = cursor ? new Date(cursor) : new Date();

    //comments here are referring to the replies
    const { comments, errors, hasMore } = await this.getReplies(
      parentId,
      dateCursor,
      limit
    );

    if (errors && errors?.length > 0) {
      return {
        errors,
      };
    }

    return {
      comments,
      hasMore,
    };
  }

  @Mutation(() => CommentResponse)
  @UseMiddleware(isAuth)
  async updootComment(
    @Ctx() { req }: MyContext,
    @Arg('commentId', () => Int) commentId: number,
    @Arg('value', () => Int) value: number
  ): Promise<CommentResponse> {
    if (![-1, 1].includes(value)) {
      return {
        errors: [CREATE_INVALID_ERROR('value', 'value must be -1 or 1')],
      };
    }

    const { userId } = req.session;
    const user = await User.findOne(userId);
    if (!user) {
      return {
        errors: [
          {
            field: 'user',
            message: 'User not found',
            code: 404,
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
    const updoot = await CommentUpdoot.findOne({
      where: { commentId, userId },
    });
    if (updoot && updoot.value !== value) {
      //if the user has already updooted the comment and now wants to change the value
      await this.updootRepo.updateUpdootValue({
        updoot,
        entity: comment,
        value,
      });
    } else if (!updoot) {
      //if the user has never updooted the comment
      const result = await this.updootRepo.createUpdoot({
        updootTarget: CommentUpdoot,
        entity: comment,
        user,
        value,
        type: 'comment',
      });
      if (!result) {
        return {
          errors: [INTERNAL_SERVER_ERROR],
        };
      }
    }
    return {
      comment,
    };
  }
  //todo: in case of deleting a parent comment, delete all the comments that are connected to it
}
