import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { MissingPost } from '../entity/PostEntities/MissingPost';
import { User } from '../entity/UserEntities/User';
import { CREATE_INVALID_ERROR, CREATE_NOT_FOUND_ERROR } from '../errors';
import { isAuth } from '../middleware/isAuth';
import { NotificationRepo } from '../repos/NotificationRepo.repo';
import { MyContext } from '../types';
import { VotingResponse } from '../types/response.types';
import { NotificationType } from '../types/enums.types';
import { PostUpdoot } from './../entity/InteractionsEntities/PostUpdoot';
import { UpdootRepo } from './../repos/UpdootRepo.repo';

@Resolver(PostUpdoot)
export class UpdootsResolver {
  constructor(
    private readonly updootRepo: UpdootRepo,
    private readonly notificationRepo: NotificationRepo
  ) {}
  @Mutation(() => VotingResponse)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<VotingResponse> {
    /** There is two cases to cover here
     *  1. User has not voted for this post before -> Create a new vote and increase/decrease the points by one (TRANSACTION)
     *  2. User has voted for this post
         2.1 User has changed his vote -> Update the current vote and increase/decrease the points by two (TRANSACTION)
         2.2 User has not changed his vote -> Means that he wants to remove his vote
      */

    //check if value is only 1 or -1
    if (![-1, 1].includes(value))
      return { errors: [CREATE_INVALID_ERROR('value')], success: false };
    const isUpvote = value === 1;

    const { userId } = req.session;
    const post = await MissingPost.findOne(postId);
    if (!post) {
      return { errors: [CREATE_NOT_FOUND_ERROR('post')], success: false };
    }

    const user = await User.findOne(userId);
    if (!user) {
      return { errors: [CREATE_NOT_FOUND_ERROR('user')], success: false };
    }

    const updoot = await PostUpdoot.findOne({ where: { postId, userId } });

    let votingRes: VotingResponse;
    if (!updoot) {
      //1. User has not voted for this post before
      votingRes = await this.updootRepo.createUpdoot({
        updootTarget: PostUpdoot,
        entity: post,
        user,
        value,
        type: 'post',
      });
    } else if (updoot.value !== value) {
      //2 User has voted for this post before and has changed his vote

      votingRes = await this.updootRepo.updateUpdootValue({
        updoot,
        entity: post,
        value,
      });
    } else {
      //2. User has not changed his vote so he want to delete it
      votingRes = await this.updootRepo.deleteUpdoot(updoot, post);
    }

    if (votingRes.success) {
      this.notificationRepo.createNotification({
        performer: user,
        content: post,
        receiverId: post.userId,
        notificationType: isUpvote
          ? NotificationType.UPVOTE
          : NotificationType.DOWNVOTE,
      });
    }

    return votingRes;
  }
}
