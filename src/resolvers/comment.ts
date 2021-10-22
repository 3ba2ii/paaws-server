import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { getConnection, In, LessThan } from 'typeorm';
import { Comment } from './../entity/InteractionsEntities/Comment';
import { CommentUpdoot } from './../entity/InteractionsEntities/CommentUpdoots';
import { User } from './../entity/UserEntities/User';
import {
  CREATE_INVALID_ERROR,
  CREATE_NOT_AUTHORIZED_ERROR,
  CREATE_NOT_FOUND_ERROR,
  INTERNAL_SERVER_ERROR,
} from './../errors';
import { isAuth } from './../middleware/isAuth';
import { UpdootRepo } from './../repos/UpdootRepo.repo';
import { MyContext } from './../types';
import {
  MissingPostComments,
  ParentCommentReplies,
} from './../types/inputTypes';
import {
  CommentResponse,
  DeleteResponse,
  PaginatedComments,
} from './../types/responseTypes';

@Resolver(Comment)
export class CommentResolver {
  constructor(private readonly updootRepo: UpdootRepo) {}

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
        errors: [CREATE_INVALID_ERROR('text')],
      };
    }
    const comment = await Comment.findOne(commentId);
    if (!comment) {
      return {
        errors: [CREATE_NOT_FOUND_ERROR('comment')],
      };
    }
    if (comment.userId !== req.session.userId) {
      return {
        errors: [
          CREATE_NOT_AUTHORIZED_ERROR(
            'comment',
            'you are not the owner of this comment'
          ),
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
        errors: [CREATE_NOT_FOUND_ERROR('user')],
      };
    }
    const comment = await Comment.findOne(commentId);
    if (!comment) {
      return {
        errors: [CREATE_NOT_FOUND_ERROR('comment')],
      };
    }
    const updoot = await CommentUpdoot.findOne({
      where: { commentId, userId },
    });
    if (updoot && updoot.value !== value) {
      //if the user has already updooted the comment and now wants to change the value
      const success = await this.updootRepo.updateUpdootValue({
        updoot,
        entity: comment,
        value,
      });
      if (!success) {
        return {
          errors: [
            {
              field: 'user',
              code: 400,
              message:
                'User has changed his vote more than 5 times in the last 10 minutes',
            },
          ],
        };
      }
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

  @Mutation(() => DeleteResponse)
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg('commentId', () => Int) commentId: number,
    @Ctx() { req }: MyContext
  ): Promise<DeleteResponse> {
    const { userId } = req.session;

    const comment = await Comment.findOne(commentId);

    if (!comment) {
      return { errors: [CREATE_NOT_FOUND_ERROR('comment')], deleted: false };
    }
    if (comment.userId !== userId) {
      return { errors: [CREATE_NOT_AUTHORIZED_ERROR('user')], deleted: false };
    }
    if (typeof comment.parentId === 'number') {
      //then it is a reply -> just delete the reply
      await comment.remove();
    } else if (comment.parentId != null) {
      //then it is a parent comment -> cascade delete the comment and all the replies related to id
      await getConnection().query(
        `
        delete from comment
        where "parentId" = $1 or id = $1
        --> this sql query will remove all the comments that are connected to the given comment and also the given comment
      `,
        [comment.id]
      );
    }
    return { deleted: true };
  }
}
