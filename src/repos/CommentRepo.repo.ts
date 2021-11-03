import { Service } from 'typedi';
import {
  Connection,
  EntityRepository,
  getConnection,
  Repository,
} from 'typeorm';
import { Comment } from '../entity/InteractionsEntities/Comment';
import { MissingPost } from './../entity/PostEntities/MissingPost';
import { CREATE_NOT_FOUND_ERROR, INTERNAL_SERVER_ERROR } from './../errors';
import { CreateCommentInputType } from './../types/inputTypes';
import { CommentResponse } from './../types/responseTypes';

@Service()
@EntityRepository(Comment)
export class CommentRepo extends Repository<Comment> {
  private readonly conn: Connection = getConnection();

  private async saveComment(
    comment: Comment,
    parentComment?: Comment | null,
    post?: MissingPost | null
  ): Promise<CommentResponse> {
    return this.conn
      .transaction(async (_tm) => {
        await comment.save();
        if (parentComment) await parentComment.save();
        if (post) await post.save();
      })
      .then(() => {
        //if everything went well - we want to send a notifications to the users
        return { comment };
      })
      .catch(() => ({ errors: [INTERNAL_SERVER_ERROR] }));
  }

  /**
    @param comment - the comment to be created
    @param parentComment - the parent comment of the comment and should be null if it is a top level comment otherwise will increase the replies count by one
    @param post - the post that the comment is being made on - will increase the commentCount by one
  */
  private async updateAndSave(
    newComment: Comment,
    parentComment: Comment | null,
    post: MissingPost
  ): Promise<CommentResponse> {
    //2. increase the commentCount of the post
    post.commentsCount += 1;
    //3. increase the repliesCount of the parent comment
    if (parentComment) parentComment.repliesCount += 1;

    return this.saveComment(newComment, parentComment, post);
  }

  public async reply(
    commentInfo: CreateCommentInputType,
    parentComment: Comment,
    post: MissingPost,
    userId: number
  ): Promise<CommentResponse> {
    /* 
    we have to check if the user is commenting on a reply -
    if so, then we must get the grandparent comment (as we only allow two levels of replying)*/
    const grandParentId = parentComment.parentId;
    if (!grandParentId) {
      //then the parent comment is a top level comment
      //1. create the reply
      const reply = Comment.create({ ...commentInfo, userId });

      return this.updateAndSave(reply, parentComment, post);
    } else {
      //then it is a reply to a reply - then we need to attack the current reply to the grand parent comment
      const grandParentComment = await Comment.findOne(grandParentId);
      if (!grandParentComment)
        return { errors: [CREATE_NOT_FOUND_ERROR('comment')] };
      if (grandParentComment.postId !== post.id)
        return { errors: [CREATE_NOT_FOUND_ERROR('post')] };

      //1. create the reply
      const reply = Comment.create({
        ...commentInfo,
        parentId: grandParentComment.id,
        userId,
      });
      return this.updateAndSave(reply, grandParentComment, post);
    }
  }
  /**
   * @param commentInfo - This will hold the comment's current info
   */
  public async comment(
    commentInfo: CreateCommentInputType,
    post: MissingPost,
    userId: number
  ): Promise<CommentResponse> {
    const comment = Comment.create({ ...commentInfo, userId });
    return this.updateAndSave(comment, null, post);
  }
}
